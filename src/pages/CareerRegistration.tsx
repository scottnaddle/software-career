import React, { useState } from 'react';
import { Plus, Save, FileText, Calendar, MapPin, Users, Code, Award, Trash2, CreditCard, Clock, Shield, Building, GraduationCap, Briefcase } from 'lucide-react';

const CareerRegistration = () => {
  const [activeTab, setActiveTab] = useState('work-experience');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState('');

  // 근무경력 상태
  const [workExperiences, setWorkExperiences] = useState([
    {
      id: 1,
      company: '',
      department: '',
      position: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      jobType: 'full-time',
      responsibilities: '',
      achievements: [],
      technologies: []
    }
  ]);

  // 학력 상태
  const [educations, setEducations] = useState([
    {
      id: 1,
      schoolName: '',
      major: '',
      degree: 'bachelor',
      startDate: '',
      endDate: '',
      isGraduated: true,
      gpa: '',
      activities: ''
    }
  ]);

  // 프로젝트 상태
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

  // 자격증 상태
  const [certificates, setCertificates] = useState([
    {
      id: 1,
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      certificateNumber: '',
      description: ''
    }
  ]);

  const addWorkExperience = () => {
    const newExperience = {
      id: Date.now(),
      company: '',
      department: '',
      position: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      jobType: 'full-time',
      responsibilities: '',
      achievements: [],
      technologies: []
    };
    setWorkExperiences([...workExperiences, newExperience]);
  };

  const removeWorkExperience = (id: number) => {
    setWorkExperiences(workExperiences.filter(exp => exp.id !== id));
  };

  const updateWorkExperience = (id: number, field: string, value: any) => {
    setWorkExperiences(workExperiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      schoolName: '',
      major: '',
      degree: 'bachelor',
      startDate: '',
      endDate: '',
      isGraduated: true,
      gpa: '',
      activities: ''
    };
    setEducations([...educations, newEducation]);
  };

  const removeEducation = (id: number) => {
    setEducations(educations.filter(edu => edu.id !== id));
  };

  const updateEducation = (id: number, field: string, value: any) => {
    setEducations(educations.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

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

  const addCertificate = () => {
    const newCertificate = {
      id: Date.now(),
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      certificateNumber: '',
      description: ''
    };
    setCertificates([...certificates, newCertificate]);
  };

  const removeCertificate = (id: number) => {
    setCertificates(certificates.filter(cert => cert.id !== id));
  };

  const updateCertificate = (id: number, field: string, value: any) => {
    setCertificates(certificates.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  const handleVerificationRequest = (type: 'standard' | 'express') => {
    setPaymentType(type);
    setShowPaymentModal(true);
  };

  const tabs = [
    { id: 'work-experience', name: '근무경력', icon: Briefcase },
    { id: 'education', name: '학력', icon: GraduationCap },
    { id: 'project', name: '프로젝트 경력', icon: Code },
    { id: 'certificate', name: '자격증', icon: Award }
  ];

  const PaymentModal = () => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardInfo, setCardInfo] = useState({
      number: '',
      expiry: '',
      cvc: '',
      name: ''
    });

    const verificationPlans = {
      standard: {
        name: '일반 검증',
        price: 15000,
        duration: '5-7일',
        features: ['전문가 검토', '블록체인 인증', '검증 리포트']
      },
      express: {
        name: '신속 검증',
        price: 35000,
        duration: '1-2일',
        features: ['우선 검토', '신속 처리', '전문가 검토', '블록체인 인증', '상세 검증 리포트']
      }
    };

    const currentPlan = verificationPlans[paymentType as keyof typeof verificationPlans];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">결제하기</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Plan Summary */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-900">{currentPlan?.name}</h4>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentPlan?.price.toLocaleString()}원
                  </div>
                  <div className="text-sm text-blue-600">처리기간: {currentPlan?.duration}</div>
                </div>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                {currentPlan?.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Shield className="h-3 w-3 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">결제 방법</h4>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                  <span>신용카드/체크카드</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span>계좌이체</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="kakao"
                    checked={paymentMethod === 'kakao'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span>카카오페이</span>
                </label>
              </div>
            </div>

            {/* Card Information */}
            {paymentMethod === 'card' && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">카드 정보</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="카드번호 (0000-0000-0000-0000)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={cardInfo.number}
                    onChange={(e) => setCardInfo({...cardInfo, number: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={cardInfo.expiry}
                      onChange={(e) => setCardInfo({...cardInfo, expiry: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={cardInfo.cvc}
                      onChange={(e) => setCardInfo({...cardInfo, cvc: e.target.value})}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="카드소유자명"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={cardInfo.name}
                    onChange={(e) => setCardInfo({...cardInfo, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* Total */}
            <div className="border-t pt-4 mb-6">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>총 결제금액</span>
                <span className="text-blue-600">{currentPlan?.price.toLocaleString()}원</span>
              </div>
            </div>

            {/* Payment Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors">
              {currentPlan?.price.toLocaleString()}원 결제하기
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              결제 완료 후 검증이 시작됩니다. 환불 정책은 이용약관을 확인해주세요.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">경력 등록</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              글로벌 비즈니스 전문가 경력을 상세히 등록하여 전문가 검증을 받으세요.
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

              {/* Verification Plans */}
              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 mb-4">검증 서비스</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">일반 검증</span>
                      <span className="text-blue-600 font-bold">15,000원</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">5-7일 처리</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• 전문가 검토</li>
                      <li>• 블록체인 인증</li>
                      <li>• 검증 리포트</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-900">신속 검증</span>
                      <span className="text-blue-600 font-bold">35,000원</span>
                    </div>
                    <p className="text-xs text-blue-700 mb-2">1-2일 처리</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• 우선 검토</li>
                      <li>• 신속 처리</li>
                      <li>• 상세 리포트</li>
                    </ul>
                  </div>
                </div>
              </div>

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
                        {activeTab === 'work-experience' && '회사별 근무 경력을 등록하세요'}
                        {activeTab === 'education' && '대학 이상의 학력을 등록하세요'}
                        {activeTab === 'project' && '개발 프로젝트 경력을 등록하세요'}
                        {activeTab === 'certificate' && '취득한 자격증을 등록하세요'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (activeTab === 'work-experience') addWorkExperience();
                      else if (activeTab === 'education') addEducation();
                      else if (activeTab === 'project') addProject();
                      else if (activeTab === 'certificate') addCertificate();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    추가
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {/* 근무경력 탭 */}
                {activeTab === 'work-experience' && (
                  <div className="space-y-8">
                    {workExperiences.map((experience, index) => (
                      <div key={experience.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">
                            근무경력 #{index + 1}
                          </h3>
                          {workExperiences.length > 1 && (
                            <button
                              onClick={() => removeWorkExperience(experience.id)}
                              className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              회사명 *
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="회사명을 입력하세요"
                              value={experience.company}
                              onChange={(e) => updateWorkExperience(experience.id, 'company', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              부서/팀
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="부서 또는 팀명을 입력하세요"
                              value={experience.department}
                              onChange={(e) => updateWorkExperience(experience.id, 'department', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              직책/직위 *
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="직책 또는 직위를 입력하세요"
                              value={experience.position}
                              onChange={(e) => updateWorkExperience(experience.id, 'position', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              고용형태
                            </label>
                            <select
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={experience.jobType}
                              onChange={(e) => updateWorkExperience(experience.id, 'jobType', e.target.value)}
                            >
                              <option value="full-time">정규직</option>
                              <option value="contract">계약직</option>
                              <option value="part-time">파트타임</option>
                              <option value="freelance">프리랜서</option>
                              <option value="intern">인턴</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              입사일 *
                            </label>
                            <input
                              type="date"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={experience.startDate}
                              onChange={(e) => updateWorkExperience(experience.id, 'startDate', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              퇴사일
                            </label>
                            <div className="space-y-2">
                              <input
                                type="date"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={experience.endDate}
                                onChange={(e) => updateWorkExperience(experience.id, 'endDate', e.target.value)}
                                disabled={experience.isCurrent}
                              />
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={experience.isCurrent}
                                  onChange={(e) => {
                                    updateWorkExperience(experience.id, 'isCurrent', e.target.checked);
                                    if (e.target.checked) {
                                      updateWorkExperience(experience.id, 'endDate', '');
                                    }
                                  }}
                                  className="h-4 w-4 text-blue-600 rounded mr-2"
                                />
                                <span className="text-sm text-gray-600">현재 재직중</span>
                              </label>
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              주요 업무 및 책임 *
                            </label>
                            <textarea
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="담당했던 주요 업무와 책임을 구체적으로 작성하세요"
                              value={experience.responsibilities}
                              onChange={(e) => updateWorkExperience(experience.id, 'responsibilities', e.target.value)}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              사용 기술 스택
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="예: Java, Spring Boot, MySQL, AWS (쉼표로 구분)"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              주요 성과 및 결과
                            </label>
                            <textarea
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="업무를 통해 달성한 성과, 개선된 지표, 수상 경력 등을 작성하세요"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 학력 탭 */}
                {activeTab === 'education' && (
                  <div className="space-y-8">
                    {educations.map((education, index) => (
                      <div key={education.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">
                            학력 #{index + 1}
                          </h3>
                          {educations.length > 1 && (
                            <button
                              onClick={() => removeEducation(education.id)}
                              className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              학교명 *
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="대학교명을 입력하세요"
                              value={education.schoolName}
                              onChange={(e) => updateEducation(education.id, 'schoolName', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              전공 *
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="전공을 입력하세요"
                              value={education.major}
                              onChange={(e) => updateEducation(education.id, 'major', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              학위 *
                            </label>
                            <select
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={education.degree}
                              onChange={(e) => updateEducation(education.id, 'degree', e.target.value)}
                            >
                              <option value="bachelor">학사</option>
                              <option value="master">석사</option>
                              <option value="doctorate">박사</option>
                              <option value="associate">전문학사</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              학점 (GPA)
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="예: 3.8/4.5"
                              value={education.gpa}
                              onChange={(e) => updateEducation(education.id, 'gpa', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              입학일 *
                            </label>
                            <input
                              type="date"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={education.startDate}
                              onChange={(e) => updateEducation(education.id, 'startDate', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              졸업일
                            </label>
                            <div className="space-y-2">
                              <input
                                type="date"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={education.endDate}
                                onChange={(e) => updateEducation(education.id, 'endDate', e.target.value)}
                                disabled={!education.isGraduated}
                              />
                              <div className="flex space-x-4">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`graduation-${education.id}`}
                                    checked={education.isGraduated}
                                    onChange={() => updateEducation(education.id, 'isGraduated', true)}
                                    className="h-4 w-4 text-blue-600 mr-2"
                                  />
                                  <span className="text-sm text-gray-600">졸업</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`graduation-${education.id}`}
                                    checked={!education.isGraduated}
                                    onChange={() => {
                                      updateEducation(education.id, 'isGraduated', false);
                                      updateEducation(education.id, 'endDate', '');
                                    }}
                                    className="h-4 w-4 text-blue-600 mr-2"
                                  />
                                  <span className="text-sm text-gray-600">재학중/중퇴</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              주요 활동 및 성과
                            </label>
                            <textarea
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="동아리, 학회, 프로젝트, 수상 경력 등을 작성하세요"
                              value={education.activities}
                              onChange={(e) => updateEducation(education.id, 'activities', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 프로젝트 경력 탭 */}
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

                {/* 자격증 탭 */}
                {activeTab === 'certificate' && (
                  <div className="space-y-8">
                    {certificates.map((certificate, index) => (
                      <div key={certificate.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">
                            자격증 #{index + 1}
                          </h3>
                          {certificates.length > 1 && (
                            <button
                              onClick={() => removeCertificate(certificate.id)}
                              className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              자격증명 *
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="자격증명을 입력하세요"
                              value={certificate.name}
                              onChange={(e) => updateCertificate(certificate.id, 'name', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              발급기관 *
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="발급기관을 입력하세요"
                              value={certificate.issuer}
                              onChange={(e) => updateCertificate(certificate.id, 'issuer', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              취득일 *
                            </label>
                            <input
                              type="date"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={certificate.issueDate}
                              onChange={(e) => updateCertificate(certificate.id, 'issueDate', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              유효기간
                            </label>
                            <input
                              type="date"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="유효기간이 없으면 비워두세요"
                              value={certificate.expiryDate}
                              onChange={(e) => updateCertificate(certificate.id, 'expiryDate', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              자격증 번호
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="자격증 번호를 입력하세요"
                              value={certificate.certificateNumber}
                              onChange={(e) => updateCertificate(certificate.id, 'certificateNumber', e.target.value)}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              설명
                            </label>
                            <textarea
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="자격증에 대한 추가 설명이나 취득 배경을 작성하세요"
                              value={certificate.description}
                              onChange={(e) => updateCertificate(certificate.id, 'description', e.target.value)}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              자격증 사본 첨부
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                              <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 mb-2">
                                자격증 사본을 첨부하세요 (PDF, JPG, PNG)
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
                    <div className="inline-flex space-x-2">
                      <button 
                        onClick={() => handleVerificationRequest('standard')}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        일반 검증 (15,000원)
                      </button>
                      <button 
                        onClick={() => handleVerificationRequest('express')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        신속 검증 (35,000원)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && <PaymentModal />}
    </div>
  );
};

export default CareerRegistration;