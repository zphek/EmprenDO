import React from 'react';
import { Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-200 bg-white z-0">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Main footer content */}
        <div className="flex justify-between items-center">
          {/* Left - Legal links */}
          <div className="flex items-center space-x-6">
            <a 
              href="/terms" 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Terms of Service
            </a>
            <a 
              href="/privacy" 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Privacy Policy
            </a>
          </div>

          {/* Center - Logo */}
          <Link href={"/"} className="absolute left-1/2 transform -translate-x-1/2">
            <img src="/logo.svg" className='h-8' alt="" />
          </Link>

          {/* Right - Social Media */}
          <div className="flex items-center space-x-4">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="text-center text-sm text-gray-500 mt-4">
          © 2024 EmprenDO. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;