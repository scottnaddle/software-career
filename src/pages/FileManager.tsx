import React, { useState, useEffect } from 'react';
import { 
  File, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Calendar,
  FileText,
  Image,
  BarChart3,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useFileUpload, UploadedFile } from '../hooks/useFileUpload';

const FileManager = () => {
  const { getUserFiles, deleteFile } = useFileUpload();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    filterAndSortFiles();
  }, [files, searchQuery, selectedType, sortBy, sortOrder]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const userFiles = await getUserFiles();
      setFiles(userFiles);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortFiles = () => {
    let filtered = [...files];

    // 검색 필터
    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 타입 필터
    if (selectedType !== 'all') {
      filtered = filtered.filter(file => file.careerType === selectedType);
    }

    // 정렬
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = (a.careerType || '').localeCompare(b.careerType || '');
          break;
        case 'date':
        default:
          comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredFiles(filtered);
  };

  const handleFileDelete = async (fileId: string) => {
    if (!confirm('정말 이 파일을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    if (!confirm(`선택한 ${selectedFiles.length}개 파일을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await Promise.all(selectedFiles.map(fileId => deleteFile(fileId)));
      setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)));
      setSelectedFiles([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalFileSize = (): string => {
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    return formatFileSize(totalBytes);
  };

  const getFileIcon = (file: UploadedFile) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const getCareerTypeLabel = (type: string | undefined) => {
    switch (type) {
      case 'work': return '근무경력';
      case 'education': return '학력';
      case 'project': return '프로젝트';
      case 'certificate': return '자격증';
      default: return '기타';
    }
  };

  const getCareerTypeColor = (type: string | undefined) => {
    switch (type) {
      case 'work': return 'bg-blue-100 text-blue-800';
      case 'education': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'certificate': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">파일 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">파일 관리</h1>
              <p className="text-gray-600">
                업로드한 증빙서류를 관리하고 다운로드할 수 있습니다.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{files.length}</div>
              <div className="text-sm text-gray-500">총 파일 수</div>
              <div className="text-sm text-gray-500 mt-1">{getTotalFileSize()}</div>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {['work', 'education', 'project', 'certificate'].map(type => {
            const typeFiles = files.filter(f => f.careerType === type);
            return (
              <div key={type} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{getCareerTypeLabel(type)}</p>
                    <p className="text-2xl font-bold text-gray-900">{typeFiles.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <div>
              <h4 className="text-red-800 font-medium">오류 발생</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="파일명으로 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">모든 유형</option>
                <option value="work">근무경력</option>
                <option value="education">학력</option>
                <option value="project">프로젝트</option>
                <option value="certificate">자격증</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort as 'date' | 'name' | 'size' | 'type');
                  setSortOrder(order as 'asc' | 'desc');
                }}
              >
                <option value="date-desc">최신순</option>
                <option value="date-asc">오래된순</option>
                <option value="name-asc">이름순 (가나다)</option>
                <option value="name-desc">이름순 (역순)</option>
                <option value="size-desc">크기순 (큰것부터)</option>
                <option value="size-asc">크기순 (작은것부터)</option>
              </select>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-700">{selectedFiles.length}개 파일 선택됨</span>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                선택 삭제
              </button>
            </div>
          )}
        </div>

        {/* 파일 목록 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredFiles.length === 0 ? (
            <div className="p-12 text-center">
              <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">파일이 없습니다</h3>
              <p className="text-gray-600">
                {searchQuery || selectedType !== 'all' 
                  ? '검색 조건에 맞는 파일이 없습니다.' 
                  : '아직 업로드한 파일이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles(filteredFiles.map(f => f.id));
                          } else {
                            setSelectedFiles([]);
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">파일명</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">유형</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">크기</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">업로드일</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFiles(prev => [...prev, file.id]);
                            } else {
                              setSelectedFiles(prev => prev.filter(id => id !== file.id));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getFileIcon(file)}
                          <span className="ml-3 text-sm font-medium text-gray-900 truncate max-w-xs">
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCareerTypeColor(file.careerType)}`}>
                          {getCareerTypeLabel(file.careerType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {file.type.startsWith('image/') && (
                            <button
                              onClick={() => window.open(file.url, '_blank')}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                              title="미리보기"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <a
                            href={file.url}
                            download={file.name}
                            className="p-1 text-gray-400 hover:text-green-600 rounded hover:bg-green-50"
                            title="다운로드"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleFileDelete(file.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManager;