import React, { useState, useRef } from 'react';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Trash2, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  X,
  Plus,
  Eye
} from 'lucide-react';
import { useFileUpload, UploadedFile } from '../hooks/useFileUpload';

interface FileUploadProps {
  careerType?: 'work' | 'education' | 'project' | 'certificate';
  careerId?: string;
  onFilesUploaded?: (files: UploadedFile[]) => void;
  onFileDeleted?: (fileId: string) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  careerType,
  careerId,
  onFilesUploaded,
  onFileDeleted,
  maxFiles = 5,
  allowedTypes,
  className = ''
}) => {
  const {
    uploadMultipleFiles,
    deleteFile,
    getUserFiles,
    uploadProgress,
    isUploading,
    validateFile,
    allowedFileTypes,
    maxFileSize
  } = useFileUpload();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 아이콘 반환
  const getFileIcon = (fileType: string, fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (fileType.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'hwp':
        return <FileText className="h-8 w-8 text-orange-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-8 w-8 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="h-8 w-8 text-orange-600" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  // 파일 크기 포맷
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 선택 처리
  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    setError('');
    const fileArray = Array.from(files);

    // 파일 개수 제한 확인
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      setError(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    // 파일 유효성 검사
    const validationErrors: string[] = [];
    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (!validation.valid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    try {
      const uploadedFilesList = await uploadMultipleFiles(fileArray, careerType, careerId);
      const newFiles = [...uploadedFiles, ...uploadedFilesList];
      setUploadedFiles(newFiles);
      onFilesUploaded?.(uploadedFilesList);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 파일 삭제 처리
  const handleFileDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
      setUploadedFiles(updatedFiles);
      onFileDeleted?.(fileId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 드래그 앤 드롭 처리
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // 파일 미리보기
  const handlePreview = (file: UploadedFile) => {
    if (file.type.startsWith('image/')) {
      setPreviewFile(file);
    } else {
      // 이미지가 아닌 파일은 새 탭에서 열기
      window.open(file.url, '_blank');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 업로드 영역 */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">파일 업로드</h3>
        <p className="text-gray-600 mb-4">
          파일을 드래그하여 놓거나 클릭하여 선택하세요
        </p>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {isUploading ? '업로드 중...' : '파일 선택'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept={allowedTypes?.join(',') || Object.values(allowedFileTypes).flat().map(ext => `.${ext}`).join(',')}
        />

        <div className="mt-4 text-xs text-gray-500">
          <p>지원 형식: PDF, DOC, DOCX, HWP, JPG, PNG, XLS, PPT 등</p>
          <p>최대 파일 크기: {formatFileSize(maxFileSize)} | 최대 {maxFiles}개 파일</p>
        </div>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-red-800 font-medium">업로드 오류</h4>
            <p className="text-red-700 text-sm whitespace-pre-line">{error}</p>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 업로드 진행률 */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          {uploadProgress.map((progress) => (
            <div key={progress.fileId} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">업로드 중...</span>
                <span className="text-sm text-gray-500">{progress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              {progress.status === 'error' && (
                <p className="text-red-600 text-sm mt-2">{progress.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 업로드된 파일 목록 */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">업로드된 파일 ({uploadedFiles.length})</h4>
          <div className="grid gap-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type, file.name)}
                  <div>
                    <h5 className="font-medium text-gray-900 truncate max-w-xs">
                      {file.name}
                    </h5>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePreview(file)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    title="미리보기"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <a
                    href={file.url}
                    download={file.name}
                    className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                    title="다운로드"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleFileDelete(file.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 이미지 미리보기 모달 */}
      {previewFile && previewFile.type.startsWith('image/') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">{previewFile.name}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-w-full max-h-[70vh] object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;