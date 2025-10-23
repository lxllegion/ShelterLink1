import React from 'react';
import { Link } from 'react-router-dom';
import AuthNavBar from '../components/AuthNavBar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <AuthNavBar />

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Connecting People with Shelter Resources
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            ShelterLink helps connect individuals and families in need with available shelter resources, 
            making it easier to find safe housing and support services.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-3 bg-transparent border border-black text-black rounded-lg font-medium hover:bg-black hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Shelter Management</h3>
            <p className="text-gray-600">Manage shelter listings and track availability in real-time</p>
          </div>
          
          <div className="text-center p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Resource Tracking</h3>
            <p className="text-gray-600">Monitor capacity and resources to help those in need</p>
          </div>
          
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Community Support</h3>
            <p className="text-gray-600">Connect with local organizations and support services</p>
          </div>
        </div>
      </div>
    </div>
  );
}