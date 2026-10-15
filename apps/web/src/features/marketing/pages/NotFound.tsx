import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';
import { NotFoundArt, PageBackdrop } from '../components/PageArt';

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
      <main id="main-content" className="relative overflow-hidden min-h-screen flex items-center justify-center px-4 py-32">
        <PageBackdrop />
        <div className="relative text-center max-w-md">
          <NotFoundArt />
          <h1 className="text-6xl md:text-7xl font-display font-bold text-brand mb-3 tracking-[-0.04em]">404</h1>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-gray-900 tracking-[-0.025em]">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="bg-brand-fill text-white px-6 py-3 rounded-xl hover:bg-brand-hover transition-all hover:-translate-y-0.5 shadow-lg shadow-brand/20 font-semibold"
              title="Return to home page"
            >
              Go Home
            </Link>
            <Link 
              to="/help" 
              className="border-2 border-brand text-brand px-6 py-3 rounded-xl hover:bg-brand-soft transition-colors font-semibold"
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
