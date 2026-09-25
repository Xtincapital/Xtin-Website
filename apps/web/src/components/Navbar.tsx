import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import RegionSwitcher from './RegionSwitcher';

const navLinkClass = ({ isActive }) =>
  `hover:text-green-600 transition pb-1 whitespace-nowrap ${isActive ? 'border-b-2 border-green-600 text-green-700' : ''}`;

const mobileNavLinkClass = ({ isActive }) =>
  `block hover:text-green-600 transition pb-1 ${isActive ? 'border-b-2 border-green-600 text-green-700' : ''}`;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const displayName = user?.first_name || user?.user_metadata?.first_name || user?.email || 'User';

  const preLoginDesktopLinks = (
    <>
      <li><NavLink to="/about" title="About Xtin Capital" className={navLinkClass}>About</NavLink></li>
      <li><NavLink to="/products" title="View our products and tools" className={navLinkClass}>Products</NavLink></li>
      <li><NavLink to="/help" title="Get support" className={navLinkClass}>Support</NavLink></li>
    </>
  );

  const postLoginDesktopLinks = (
    <>
      <li><NavLink to="/" end title="Go to Platform home" className={navLinkClass}>Platform</NavLink></li>
      <li><NavLink to="/learn" title="Access financial education content" className={navLinkClass}>Learn</NavLink></li>
      <li><NavLink to="/tools" title="View financial calculators and tools" className={navLinkClass}>Tools</NavLink></li>
      <li><NavLink to="/fundakamental" title="Open fundamental analysis dashboard" className={navLinkClass}>Fundakamental</NavLink></li>
      <li><NavLink to="/algos" title="View trading algorithms" className={navLinkClass}>Algorithms</NavLink></li>
      <li><NavLink to="/backtest" title="Backtest strategies with AI" className={navLinkClass}>Backtest</NavLink></li>
      <li><NavLink to="/journal" title="Access trading journal" className={navLinkClass}>Journal</NavLink></li>
      <li><NavLink to="/gini" title="Open Gini AI advisor" className={navLinkClass}>GiniAI</NavLink></li>
      <li><NavLink to="/newsletter" title="Subscribe to our financial newsletter" className={navLinkClass}>Newsletter</NavLink></li>
    </>
  );

  const preLoginMobileLinks = (
    <>
      <li role="menuitem"><NavLink to="/about" className={mobileNavLinkClass}>About</NavLink></li>
      <li role="menuitem"><NavLink to="/products" className={mobileNavLinkClass}>Products</NavLink></li>
      <li role="menuitem"><NavLink to="/help" className={mobileNavLinkClass}>Support</NavLink></li>
    </>
  );

  const postLoginMobileLinks = (
    <>
      <li role="menuitem"><NavLink to="/dashboard" className={mobileNavLinkClass}>Dashboard</NavLink></li>
      <li role="menuitem"><NavLink to="/" end className={mobileNavLinkClass}>Platform</NavLink></li>
      <li role="menuitem"><NavLink to="/tools" className={mobileNavLinkClass}>Tools</NavLink></li>
      <li role="menuitem"><NavLink to="/learn" className={mobileNavLinkClass}>Learn</NavLink></li>
      <li role="menuitem"><NavLink to="/fundakamental" className={mobileNavLinkClass}>Fundakamental</NavLink></li>
      <li role="menuitem"><NavLink to="/newsletter" className={mobileNavLinkClass}>Newsletter</NavLink></li>
      <li role="menuitem"><NavLink to="/journal" className={mobileNavLinkClass}>Journal</NavLink></li>
      <li role="menuitem"><NavLink to="/algos" className={mobileNavLinkClass}>Algorithms</NavLink></li>
      <li role="menuitem"><NavLink to="/backtest" className={mobileNavLinkClass}>Backtest</NavLink></li>
      <li role="menuitem"><NavLink to="/gini" className={mobileNavLinkClass}>Gini AI</NavLink></li>
    </>
  );

  return (
    <>
      <nav className="bg-white shadow-md py-4 px-4 md:px-8 lg:px-12 fixed top-0 left-0 right-0 z-50" role="navigation" aria-label="Main navigation">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-green-600 text-white px-4 py-2 rounded"
        >
          Skip to main content
        </a>

        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-3 shrink-0 mr-6 lg:mr-10">
            <Link
              to="/"
              className="text-2xl font-bold text-gray-900 whitespace-nowrap"
              aria-label="Xtin Capital - Home"
            >
              Xtin <span className="text-green-600">Capital</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6 lg:gap-8 ml-auto">
            <ul className="flex items-center gap-6 md:gap-7 lg:gap-9 text-sm lg:text-base text-gray-700 font-medium whitespace-nowrap">
              {user ? postLoginDesktopLinks : preLoginDesktopLinks}
            </ul>
            <div className="flex items-center gap-3">
              <RegionSwitcher />
              <ThemeToggle />
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-700 hover:text-green-600 transition font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
                    title="View your dashboard"
                  >
                    Hello, {displayName}!
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-4 ml-auto">
            <RegionSwitcher />
            <ThemeToggle />
            {user && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-green-600 transition font-medium px-3 py-2 rounded-lg hover:bg-gray-100 text-sm"
              >
                {displayName}
              </button>
            )}
            <button
              className="text-gray-700 text-2xl hover:text-green-600 transition"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              ☰
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav id="mobile-menu" className="md:hidden bg-white border-t border-gray-200" aria-label="Mobile navigation">
            <ul className="px-6 py-4 space-y-4 text-gray-700" role="menu">
              {user ? postLoginMobileLinks : preLoginMobileLinks}
            </ul>
          </nav>
        )}
      </nav>

      {!isHome && (
        <button
          onClick={() => navigate(-1)}
          className="fixed top-[112px] left-6 md:left-12 lg:left-24 z-40 hidden md:flex items-center gap-1.5 text-gray-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition text-sm font-semibold bg-white dark:bg-slate-900 px-3.5 py-2 rounded-full shadow-md border border-gray-200 dark:border-slate-700"
          aria-label="Go back"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}
    </>
  );
};

export default Navbar;
