import React from 'react';
import { Shield, FileText, Award, ArrowRight, CheckCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4 mr-2" />
            Certified Global Business Expert Platform
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Verify Your Global Business
            <br />
            <span className="text-blue-600">Expertise with Confidence</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Register and verify your international business experience to receive official career certificates.
            <br />
            Build credible career management for better global opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 flex items-center justify-center">
              Register Your Career
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200">
              Explore Services
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Government Certified Service
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Blockchain-based Verification
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Free to Use
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <FileText className="h-8 w-8 text-blue-600 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Career Registration</h3>
            <p className="text-gray-600 mb-6">
              Register your global business projects, education, and certifications for expert verification.
            </p>
            <button className="text-blue-600 font-semibold hover:text-blue-700 flex items-center">
              Get Started <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
              <Shield className="h-8 w-8 text-green-600 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Expert Verification</h3>
            <p className="text-gray-600 mb-6">
              Industry experts review your career and certify it securely with blockchain technology.
            </p>
            <button className="text-green-600 font-semibold hover:text-green-700 flex items-center">
              Learn More <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
              <Award className="h-8 w-8 text-purple-600 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Certificate Issue</h3>
            <p className="text-gray-600 mb-6">
              Receive official career certificates based on your verified global business experience.
            </p>
            <button className="text-purple-600 font-semibold hover:text-purple-700 flex items-center">
              Issue Now <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;