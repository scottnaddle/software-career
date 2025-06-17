import React from 'react';
import { TrendingUp, Users, Award, Building, Globe, Clock } from 'lucide-react';

const Statistics = () => {
  const stats = [
    {
      icon: Users,
      number: '50,247',
      label: 'Registered Experts',
      description: 'Verified global business experts participating',
      growth: '+15%'
    },
    {
      icon: Award,
      number: '127,893',
      label: 'Verified Careers',
      description: 'Trusted careers reviewed by industry experts',
      growth: '+23%'
    },
    {
      icon: Building,
      number: '2,847',
      label: 'Partner Companies',
      description: 'Companies using career verification services',
      growth: '+31%'
    },
    {
      icon: Globe,
      number: '15',
      label: 'Supported Countries',
      description: 'Global standard career certificate recognition',
      growth: '+3'
    }
  ];

  const achievements = [
    {
      title: 'Government Certified Service',
      description: 'Government-certified global business expert career management platform',
      icon: Award,
      color: 'blue'
    },
    {
      title: 'Blockchain Certification',
      description: 'Career information protection with tamper-proof blockchain technology',
      icon: Clock,
      color: 'green'
    },
    {
      title: 'ISO 27001 Certified',
      description: 'International standard information security management system certification',
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Trusted Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Check the key indicators showing the achievements and 
            reliability of K-Xpert chosen by numerous global business experts and companies.
          </p>
        </div>

        {/* Main Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
                <stat.icon className="h-8 w-8 text-blue-600 group-hover:text-white" />
              </div>
              
              <div className="flex items-center justify-center mb-2">
                <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                <div className="ml-2 bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                  {stat.growth}
                </div>
              </div>
              
              <div className="text-lg font-semibold text-gray-900 mb-2">{stat.label}</div>
              <p className="text-gray-600 text-sm">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-3xl p-12 shadow-lg">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Certifications & Achievements
            </h3>
            <p className="text-lg text-gray-600">
              Introducing the major certifications and achievements received by K-Xpert.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => {
              const getColorClasses = (color: string) => {
                const colors = {
                  blue: 'bg-blue-50 text-blue-600',
                  green: 'bg-green-50 text-green-600',
                  purple: 'bg-purple-50 text-purple-600'
                };
                return colors[color as keyof typeof colors];
              };

              return (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 ${getColorClasses(achievement.color)} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <achievement.icon className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {achievement.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {achievement.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">K-Xpert Development History</h3>
            <p className="text-blue-100 text-lg">
              Providing better services through continuous innovation and development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">2021</div>
              <div className="text-blue-100 text-sm">Service Launch</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">2022</div>
              <div className="text-blue-100 text-sm">Government Certification</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">2023</div>
              <div className="text-blue-100 text-sm">Blockchain Implementation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">2024</div>
              <div className="text-blue-100 text-sm">Global Expansion</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;