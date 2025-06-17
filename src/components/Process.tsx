import React from 'react';
import { UserPlus, FileText, Shield, Award, ArrowRight } from 'lucide-react';

const Process = () => {
  const steps = [
    {
      step: 1,
      icon: UserPlus,
      title: 'Sign Up',
      description: 'Join K-Xpert with simple information input.',
      details: ['Basic information input', 'Email verification', 'Profile setup'],
      color: 'blue'
    },
    {
      step: 2,
      icon: FileText,
      title: 'Career Registration',
      description: 'Register various careers including global business projects, education, and certifications.',
      details: ['Detailed project information', 'Specify skill sets', 'Attach deliverables'],
      color: 'green'
    },
    {
      step: 3,
      icon: Shield,
      title: 'Expert Verification',
      description: 'Industry experts review registered careers and certify them with blockchain technology.',
      details: ['Expert review', 'Blockchain certification', 'Verification completion notification'],
      color: 'purple'
    },
    {
      step: 4,
      icon: Award,
      title: 'Certificate Issue',
      description: 'Receive official certificates based on your verified career.',
      details: ['Instant issuance available', 'PDF download', 'QR code authenticity verification'],
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'bg-blue-600',
        text: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'bg-green-600',
        text: 'text-green-600',
        border: 'border-green-200'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'bg-purple-600',
        text: 'text-purple-600',
        border: 'border-purple-200'
      },
      orange: {
        bg: 'bg-orange-50',
        icon: 'bg-orange-600',
        text: 'text-orange-600',
        border: 'border-orange-200'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            How to Use
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start professional career management with 4 simple steps.
            We provide detailed guides for each step so anyone can use it easily.
          </p>
        </div>

        <div className="relative">
          {/* Desktop Process Flow */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between mb-16">
              {steps.map((step, index) => {
                const colorClasses = getColorClasses(step.color);
                return (
                  <React.Fragment key={step.step}>
                    <div className="flex flex-col items-center max-w-xs">
                      <div className={`w-20 h-20 ${colorClasses.icon} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                        <step.icon className="h-10 w-10 text-white" />
                      </div>
                      <div className={`w-12 h-12 ${colorClasses.bg} rounded-full flex items-center justify-center mb-4 border-2 ${colorClasses.border}`}>
                        <span className={`text-lg font-bold ${colorClasses.text}`}>{step.step}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{step.title}</h3>
                      <p className="text-gray-600 text-center text-sm leading-relaxed mb-4">
                        {step.description}
                      </p>
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center text-xs text-gray-500">
                            <div className={`w-1.5 h-1.5 ${colorClasses.icon} rounded-full mr-2`}></div>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex items-center">
                        <ArrowRight className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Mobile Process Flow */}
          <div className="lg:hidden space-y-8">
            {steps.map((step, index) => {
              const colorClasses = getColorClasses(step.color);
              return (
                <div key={step.step} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 ${colorClasses.icon} rounded-xl flex items-center justify-center shadow-lg`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className={`w-8 h-8 ${colorClasses.bg} rounded-full flex items-center justify-center mt-3 border-2 ${colorClasses.border}`}>
                      <span className={`text-sm font-bold ${colorClasses.text}`}>{step.step}</span>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      {step.description}
                    </p>
                    <ul className="space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-xs text-gray-500">
                          <div className={`w-1.5 h-1.5 ${colorClasses.icon} rounded-full mr-2`}></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Start Right Now
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              From sign-up to certificate issuance, the entire process is free.
              Build professional career management for a better career.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200">
                Free Sign Up
              </button>
              <button className="border-2 border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-600 px-8 py-3 rounded-xl font-semibold transition-all duration-200">
                Try Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;