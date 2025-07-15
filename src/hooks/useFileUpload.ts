import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadDate: string;
  careerType?: 'work' | 'education' | 'project' | 'certificate';
  careerId?: string;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export const useFileUpload = () => {
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 허용된 파일 타입 정의
  const allowedFileTypes = {
    documents: ['pdf', 'doc', 'docx', 'hwp'],
    images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    spreadsheets: ['xls', 'xlsx', 'csv'],
    presentations: ['ppt', 'pptx'],
    archives: ['zip', 'rar', '7z']
  };

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const maxFilesPerUpload = 5;

  // 파일 유효성 검사
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // 파일 크기 확인
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `파일 크기가 너무 큽니다. 최대 ${maxFileSize / 1024 / 1024}MB까지 업로드 가능합니다.`
      };
    }

    // 파일 타입 확인
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allAllowedTypes = Object.values(allowedFileTypes).flat();
    
    if (!fileExtension || !allAllowedTypes.includes(fileExtension)) {
      return {
        valid: false,
        error: `지원하지 않는 파일 형식입니다. 허용 형식: ${allAllowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  };

  // 파일명 안전화 (특수문자 제거 및 중복 방지)
  const sanitizeFileName = (fileName: string, userId: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9가-힣]/g, '_');
    
    return `${userId}/${timestamp}_${randomString}_${sanitizedName}.${extension}`;
  };

  // 단일 파일 업로드
  const uploadFile = async (
    file: File, 
    careerType?: 'work' | 'education' | 'project' | 'certificate',
    careerId?: string
  ): Promise<UploadedFile | null> => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    // 파일 유효성 검사
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sanitizedFileName = sanitizeFileName(file.name, user.id);

    try {
      // 업로드 진행률 초기화
      setUploadProgress(prev => [...prev, {
        fileId,
        progress: 0,
        status: 'uploading'
      }]);

      // Supabase Storage에 파일 업로드
      const { data, error } = await supabase.storage
        .from('career-documents')
        .upload(sanitizedFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // 업로드된 파일의 공개 URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('career-documents')
        .getPublicUrl(sanitizedFileName);

      // 파일 메타데이터를 데이터베이스에 저장
      const { data: fileRecord, error: dbError } = await supabase
        .from('file_attachments')
        .insert([
          {
            user_id: user.id,
            original_name: file.name,
            file_name: sanitizedFileName,
            file_size: file.size,
            file_type: file.type,
            file_url: publicUrl,
            career_type: careerType,
            career_id: careerId,
            upload_date: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (dbError) {
        // 데이터베이스 저장 실패 시 스토리지에서 파일 삭제
        await supabase.storage
          .from('career-documents')
          .remove([sanitizedFileName]);
        throw dbError;
      }

      // 업로드 완료 상태 업데이트
      setUploadProgress(prev => prev.map(p => 
        p.fileId === fileId 
          ? { ...p, progress: 100, status: 'completed' as const }
          : p
      ));

      const uploadedFile: UploadedFile = {
        id: fileRecord.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: publicUrl,
        uploadDate: fileRecord.upload_date,
        careerType,
        careerId
      };

      return uploadedFile;
    } catch (error: any) {
      // 오류 상태 업데이트
      setUploadProgress(prev => prev.map(p => 
        p.fileId === fileId 
          ? { ...p, status: 'error' as const, error: error.message }
          : p
      ));
      throw error;
    }
  };

  // 다중 파일 업로드
  const uploadMultipleFiles = async (
    files: File[],
    careerType?: 'work' | 'education' | 'project' | 'certificate',
    careerId?: string
  ): Promise<UploadedFile[]> => {
    if (files.length > maxFilesPerUpload) {
      throw new Error(`한 번에 최대 ${maxFilesPerUpload}개의 파일만 업로드할 수 있습니다.`);
    }

    setIsUploading(true);
    const uploadPromises = files.map(file => uploadFile(file, careerType, careerId));
    
    try {
      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads: UploadedFile[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          successfulUploads.push(result.value);
        } else if (result.status === 'rejected') {
          errors.push(`${files[index].name}: ${result.reason.message}`);
        }
      });

      if (errors.length > 0) {
        console.warn('일부 파일 업로드 실패:', errors);
      }

      return successfulUploads;
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 삭제
  const deleteFile = async (fileId: string): Promise<boolean> => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      // 데이터베이스에서 파일 정보 조회
      const { data: fileRecord, error: fetchError } = await supabase
        .from('file_attachments')
        .select('file_name, user_id')
        .eq('id', fileId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !fileRecord) {
        throw new Error('파일을 찾을 수 없습니다.');
      }

      // Supabase Storage에서 파일 삭제
      const { error: storageError } = await supabase.storage
        .from('career-documents')
        .remove([fileRecord.file_name]);

      if (storageError) {
        throw storageError;
      }

      // 데이터베이스에서 파일 레코드 삭제
      const { error: dbError } = await supabase
        .from('file_attachments')
        .delete()
        .eq('id', fileId)
        .eq('user_id', user.id);

      if (dbError) {
        throw dbError;
      }

      return true;
    } catch (error: any) {
      console.error('파일 삭제 오류:', error);
      throw error;
    }
  };

  // 사용자의 파일 목록 조회
  const getUserFiles = async (
    careerType?: 'work' | 'education' | 'project' | 'certificate',
    careerId?: string
  ): Promise<UploadedFile[]> => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    let query = supabase
      .from('file_attachments')
      .select('*')
      .eq('user_id', user.id)
      .order('upload_date', { ascending: false });

    if (careerType) {
      query = query.eq('career_type', careerType);
    }

    if (careerId) {
      query = query.eq('career_id', careerId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data.map(record => ({
      id: record.id,
      name: record.original_name,
      size: record.file_size,
      type: record.file_type,
      url: record.file_url,
      uploadDate: record.upload_date,
      careerType: record.career_type,
      careerId: record.career_id
    }));
  };

  // 파일 다운로드 URL 생성 (임시 URL)
  const getDownloadUrl = async (fileName: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('career-documents')
      .createSignedUrl(fileName, 3600); // 1시간 유효

    if (error) {
      throw error;
    }

    return data.signedUrl;
  };

  // 업로드 진행률 초기화
  const clearUploadProgress = () => {
    setUploadProgress([]);
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    getUserFiles,
    getDownloadUrl,
    uploadProgress,
    isUploading,
    clearUploadProgress,
    validateFile,
    allowedFileTypes,
    maxFileSize,
    maxFilesPerUpload
  };
};