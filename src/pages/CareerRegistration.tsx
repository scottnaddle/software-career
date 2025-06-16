import React, { useState } from 'react';
import { Plus, Save, FileText, Calendar, MapPin, Users, Code, Award, Trash2 } from 'lucide-react';

const CareerRegistration = () => {
  const [activeTab, setActiveTab] = useState('project');
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: '',
      company: '',
      period: { start: '', end: '' },
      role: '',
      description: '',
      technologies: [],
      achievements: []
    }
  ]);

  const addProject = () => {
    const newProject = {
      id: Date.now(),
      title: '',
      company: '',
      period: { start: '', end: '' },
      role: '',
      description: '',
      technologies: [],
      achievements: []
    };
    setProjects([...projects, newProject]);
  };

  const removeProject = (id: number) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const updateProject = (id: number, field: string, value: any) => {
    setProjects(projects.map(project => 
      project.id === id ? { ...project, [field]: value } : project
    ));
  };

  const tabs = [
    { id: 'project', name: '프로젝트 경력', icon: Code },
    { id: 'education', name: '교육 이수', icon: FileText },
    { id: 'certificate', name: '자격증', icon: Award },
    { id: 'experience', name: '기타 경력', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">경력 등록</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              소프트웨어 개발 경력을 상세히 등록하여 전문가 검증을 받으세요.
              정확하고 구체적인 정보를 입력할수록 더 신뢰할 수 있는 경력 인증을 받을 수 있습니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">경력 유형</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </nav>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">등록 팁</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 구체적인 성과와 결과 명시</li>
                  <li>• 사용한 기술 스택 상세 기록</li>
                  <li>• 증빙 자료 첨부 권장</li>
                  <li>• 정확한 기간 정보 입력</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm">
              {/* Tab Content Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {tabs.find(tab => tab.id === activeTab)?.icon && (
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        {React.createElement(tabs.find(tab => tab.id === activeTab)!.icon, {
                          className: "h-5 w-5 text-blue-600"
                        })}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {tabs.find(tab => tab.id === activeTab)?.name}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {activeTab === 'project' && '개발 프로젝트 경력을 등록하세요'}
                        {activeTab === 'education' && '교육 과정 이수 내역을 등록하세요'}
                        {activeTab === 'certificate' && '취득한 자격증을 등록하세요'}
                        {activeTab === 'experience' && '기타 관련 경력을 등록하세요'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={addProject}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    추가
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {activeTab === 'project' && (
                  <div className="space-y-8">
                    {projects.map((project, index) => (
                      <div key={project.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">
                            프로젝트 #{index + 1}
                          </h3>
                          {projects.length > 1 && (
                            <button
                              onClick={() => removeProject(project.id)}
                              className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              프로젝트명 *
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="프로젝트명을 입력하세요"
                              value={project.title}
                              onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              회사/기관명 *
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="회사 또는 기관명을 입력하세요"
                              value={project.company}
                              onChange={(e) => updateProject(project.id, 'company', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              시작일 *
                            </label>
                            <input
                              type="date"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={project.period.start}
                              onChange={(e) => updateProject(project.id, 'period', { ...project.period, start: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              종료일 *
                            </label>
                            <input
                              type="date"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={project.period.end}
                              onChange={(e) => updateProject(project.id, 'period', { ...project.period, end: e.target.value })}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              담당 역할 *
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="예: 백엔드 개발자, 프론트엔드 개발자, 풀스택 개발자"
                              value={project.role}
                              onChange={(e) => updateProject(project.id, 'role', e.target.value)}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              프로젝트 설명 *
                            </label>
                            <textarea
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="프로젝트의 목적, 주요 기능, 본인의 기여도 등을 구체적으로 작성하세요"
                              value={project.description}
                              onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              사용 기술 스택
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="예: React, Node.js, PostgreSQL, AWS (쉼표로 구분)"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              주요 성과 및 결과
                            </label>
                            <textarea
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="프로젝트를 통해 달성한 성과, 개선된 지표, 학습한 내용 등을 작성하세요"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              증빙 자료 첨부
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 mb-2">
                                프로젝트 관련 문서, 스크린샷, 링크 등을 첨부하세요
                              </p>
                              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                파일 선택
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'education' && (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">교육 이수 내역 등록</h3>
                    <p className="text-gray-600 mb-6">
                      참여한 교육 과정, 부트캠프, 온라인 강의 등을 등록하세요.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                      교육 과정 추가
                    </button>
                  </div>
                )}

                {activeTab === 'certificate' && (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">자격증 등록</h3>
                    <p className="text-gray-600 mb-6">
                      취득한 IT 관련 자격증을 등록하여 전문성을 인증받으세요.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                      자격증 추가
                    </button>
                  </div>
                )}

                {activeTab === 'experience' && (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">기타 경력 등록</h3>
                    <p className="text-gray-600 mb-6">
                      오픈소스 기여, 기술 블로그, 컨퍼런스 발표 등 기타 경력을 등록하세요.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                      기타 경력 추가
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-between">
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                    임시저장
                  </button>
                  <div className="space-x-4">
                    <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                      미리보기
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      검증 요청
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerRegistration;