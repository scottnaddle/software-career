import React from 'react';
import { Award, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, FileText, Shield, Users } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Award className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">K-Xpert</span>
                <div className="text-xs text-gray-400">Global Business Expert Platform</div>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              The world's first government-certified global business expert career management platform, 
              providing trusted career verification services using blockchain technology.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Services
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Career Registration</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Expert Verification</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Certificate Issue</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Enterprise Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">API Integration</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Career Analytics</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Support
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">User Guide</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Announcements</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Expert Guide</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Enterprise Guide</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Contact Us</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-blue-400" />
                <span>+82-2-2023-9999</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-blue-400" />
                <span>support@k-xpert.com</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-blue-400 mt-1" />
                <span>Anam Tower Building 7F<br />311 Teheran-ro, Gangnam-gu<br />Seoul, South Korea</span>
              </div>
            </div>
            
            {/* Newsletter */}
            <div className="mt-8">
              <h4 className="font-semibold text-white mb-4">Newsletter</h4>
              <p className="text-gray-400 text-sm mb-4">
                Get the latest updates and useful information.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-blue-500 text-white text-sm"
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg transition-colors text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 K-Xpert. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-end space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <span>Business Registration: 123-45-67890</span>
              <span>Telecommunications Business Report: 2024-Seoul-Gangnam-0123</span>
            </div>
          </div>
          
          {/* Certifications */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="flex flex-wrap justify-center items-center space-x-8 text-xs text-gray-500">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-blue-400" />
                Government Certified
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-green-400" />
                ISO 27001 Certified
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-purple-400" />
                Blockchain Technology Applied
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;