import React from 'react';
import { MapPin, Clock, DollarSign, Users, Heart, ExternalLink } from 'lucide-react';

const JobListings = () => {
  const jobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: '네이버',
      location: '서울 강남구',
      salary: '7,000만원 ~ 1억원',
      type: '정규직',
      experience: '5년 이상',
      tags: ['React', 'TypeScript', 'Next.js', 'GraphQL'],
      logo: 'N',
      urgent: true,
      bookmarked: false
    },
    {
      id: 2,
      title: 'Backend Engineer',
      company: '카카오',
      location: '경기 성남시',
      salary: '6,000만원 ~ 8,000만원',
      type: '정규직',
      experience: '3년 이상',
      tags: ['Java', 'Spring', 'Kafka', 'Redis'],
      logo: 'K',
      urgent: false,
      bookmarked: true
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: '토스',
      location: '서울 강남구',
      salary: '5,000만원 ~ 7,000만원',
      type: '정규직',
      experience: '2년 이상',
      tags: ['Node.js', 'React', 'AWS', 'Docker'],
      logo: 'T',
      urgent: false,
      bookmarked: false
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      company: '배달의민족',
      location: '서울 송파구',
      salary: '6,500만원 ~ 9,000만원',
      type: '정규직',
      experience: '4년 이상',
      tags: ['Kubernetes', 'Terraform', 'Jenkins', 'Monitoring'],
      logo: 'B',
      urgent: true,
      bookmarked: false
    },
    {
      id: 5,
      title: 'Mobile App Developer',
      company: '쿠팡',
      location: '서울 중구',
      salary: '5,500만원 ~ 7,500만원',
      type: '정규직',
      experience: '3년 이상',
      tags: ['React Native', 'iOS', 'Android', 'Firebase'],
      logo: 'C',
      urgent: false,
      bookmarked: true
    },
    {
      id: 6,
      title: 'Data Engineer',
      company: '라인',
      location: '서울 강남구',
      salary: '6,000만원 ~ 8,500만원',
      type: '정규직',
      experience: '3년 이상',
      tags: ['Python', 'Spark', 'Kafka', 'Airflow'],
      logo: 'L',
      urgent: false,
      bookmarked: false
    }
  ];

  const getLogoColor = (logo: string) => {
    const colors = {
      'N': 'bg-green-500',
      'K': 'bg-yellow-500',
      'T': 'bg-blue-500',
      'B': 'bg-red-500',
      'C': 'bg-purple-500',
      'L': 'bg-green-600'
    };
    return colors[logo as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            인기 채용공고
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            지금 가장 인기 있는 개발자 채용공고를 확인해보세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${getLogoColor(job.logo)} rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3`}>
                    {job.logo}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 font-medium">{job.company}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {job.urgent && (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                      급구
                    </span>
                  )}
                  <button
                    className={`p-2 rounded-full transition-colors ${
                      job.bookmarked
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-gray-300 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${job.bookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Job Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{job.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{job.salary}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">{job.type} • {job.experience}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {job.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">2일 전 등록</span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center">
                  지원하기
                  <ExternalLink className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200">
            모든 채용공고 보기
          </button>
        </div>
      </div>
    </section>
  );
};

export default JobListings;