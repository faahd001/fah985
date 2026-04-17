import React from 'react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About ConnectPro</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
        ConnectPro was created with a single mission taking the friction out of finding high-quality technical professionals. 
      </p>
      
      <div className="grid md:grid-cols-2 gap-12 mt-16 text-left">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">For Customers</h2>
          <p className="text-gray-600 mb-4">
            Finding reliable electricians, software engineers, and mechanics shouldn't be a gamble. ConnectPro provides vetted profiles, genuine user reviews, and secure messaging so you can hire with confidence.
          </p>
          <ul className="space-y-2 text-gray-600 list-disc pl-5">
            <li>Search by specialization and location</li>
            <li>Directly book services</li>
            <li>Leave ratings after project completion</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">For Engineers</h2>
          <p className="text-gray-600 mb-4">
            ConnectPro acts as your digital storefront. Showcase your skills, build a solid reputation, and let leads come directly to you through our built-in platform.
          </p>
          <ul className="space-y-2 text-gray-600 list-disc pl-5">
            <li>Set up your professional profile</li>
            <li>Manage inquiries and bookings</li>
            <li>Build a verified review portfolio</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
