import React from 'react';
import { CheckCircle, Shield, Clock, Globe, Award, Users } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: Shield,
      title: 'Trusted Career Management',
      description: 'Reliable career management with tamper-proof credibility through blockchain technology and expert verification.',
      stats: '99.9% verification accuracy'
    },
    {
      icon: Clock,
      title: 'Fast Certificate Issuance',
      description: 'Instantly issue official career certificates anytime, anywhere for use in job applications or career transitions.',
      stats: 'Average 3 minutes issuance'
    },
    {
      icon: Globe,
      title: 'International Recognition',
      description: 'Global standard career management that can be utilized for overseas employment or global company applications.',
      stats: 'Recognized in 15 countries'
    },
    {
      icon: Award,
      title: 'Career Growth Support',
      description: 'Support continuous growth of global business experts through systematic career analysis and customized growth direction.',
      stats: 'Average 23% salary increase'
    },
    {
      icon: Users,
      title: 'Networking Opportunities',
      description: 'Discover new opportunities and collaboration possibilities through networking with verified global business experts.',
      stats: '50,000+ experts participating'
    },
    {
      icon: CheckCircle,
      title: 'Completely Free Service',
      description: 'All core features are provided free of charge, allowing anyone to start professional career management without burden.',
      stats: '100% free'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Why Choose K-Xpert
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Beyond simple resume management, we provide special benefits for 
            systematic and professional management of global business expert careers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <benefit.icon className="h-7 w-7 text-blue-600 group-hover:text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{benefit.stats}</div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                {benefit.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Success Stories */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Many Global Business Experts Are Already Experiencing It
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50,000+</div>
              <div className="text-blue-100">Registered Experts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">120,000+</div>
              <div className="text-blue-100">Verified Careers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">85,000+</div>
              <div className="text-blue-100">Issued Certificates</div>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-lg text-white/90 italic mb-4">
              "Thanks to systematically managed career through K-Xpert, I was able to successfully transition to my desired company. 
              The verified career certificate was a great help."
            </p>
            <div className="text-white font-semibold">John Kim, Senior Global Business Manager</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;