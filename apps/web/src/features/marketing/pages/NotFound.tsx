import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';

const NotFound = () => {
  return (
    <div className="bg-white text-gray-800">
      <SEO
        title="Page Not Found - 404 Error"
        description="The page you're looking for doesn't exist. Return to Xtin Capital and explore our financial tools and advisory services."
        canonicalUrl="/404"
        noIndex={true}
      />
      <Navbar />
      <main id="main-content" className="min-h-screen flex items-center justify-center px-4 py-32">
        <div className="text-center max-w-md">
          <h1 className="font-display text-7xl font-normal text-green-600 mb-4">404</h1>
          <h2 className="text-3xl font-display font-normal mb-4 text-gray-900 tracking-[-0.015em]">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              title="Return to home page"
            >
              Go Home
            </Link>
            <Link 
              to="/help" 
              className="border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors font-semibold"
              title="Visit help center"
            >
              Get Help
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
