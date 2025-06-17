import React from 'react';
import { FileText, Shield, Award, Building, Users, Database } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: FileText,
      title: 'Career Registration & Management',
      description: 'Systematically register and manage your global business projects, education, certifications, and achievements.',
      features: ['Detailed project information registration', 'Skills and role specification', 'Achievement and deliverable attachment', 'Continuous updates available'],
      color: 'blue'
    },
    {
      icon: Shield,
      title: 'Expert Verification & Certification',
      description: 'Industry experts review your registered career and securely certify it with blockchain technology to ensure credibility.',
      features: ['Expert review system', 'Blockchain-based certification', 'Anti-forgery technology', 'Real-time verification status'],
      color: 'green'
    },
    {
      icon: Award,
      title: 'Official Certificate Issue',
      description: 'Receive government-certified career certificates based on your verified experience for use in job applications or career transitions.',
      features: ['PDF format certificates', 'QR code authenticity verification', 'Multi-language support', 'Instant issuance available'],
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        accent: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        accent: 'text-green-600',
        border: 'border-green-200'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        accent: 'text-purple-600',
        border: 'border-purple-200'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Core Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Introducing the core services of our professional platform for systematically 
            managing and verifying global business expert careers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const colorClasses = getColorClasses(service.color);
            return (
              <div
                key={index}
                className={`${colorClasses.bg} rounded-2xl p-8 border ${colorClasses.border} hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm">
                    <service.icon className={`h-6 w-6 ${colorClasses.icon}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {service.description}
                </p>

                <ul className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className={`w-2 h-2 ${colorClasses.bg} rounded-full mr-3 border-2 ${colorClasses.border}`}></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Enterprise Services */}
        <div className="bg-gray-50 rounded-3xl p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Enterprise Services</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Special services designed for recruiters and HR professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Career Verification Service</h4>
              <p className="text-gray-600 text-sm">
                Quickly and accurately verify candidates' careers to improve recruitment process efficiency.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-teal-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Talent Matching</h4>
              <p className="text-gray-600 text-sm">
                Recommend optimal talent from our verified expert pool that matches your company's requirements.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">API Integration</h4>
              <p className="text-gray-600 text-sm">
                Automate career verification processes by integrating with your company's HR systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;