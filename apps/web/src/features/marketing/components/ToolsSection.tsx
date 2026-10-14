import React from 'react';
import { Link } from 'react-router-dom';

const tools = [
  {
    title: 'Algorithms',
    description: 'AI-powered trading strategies for modern markets.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    link: '/algos',
  },
  {
    title: 'Calculators',
    description: 'SIP, FD, tax & 19+ financial calculators.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <path d="M8 6h8M8 10h8M8 14h2M8 18h2M14 14h2M14 18h2"/>
      </svg>
    ),
    link: '/tools',
  },
  {
    title: 'Learn',
    description: 'Free courses on trading and finance.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
      </svg>
    ),
    link: '/learn',
  },
  {
    title: 'Fundakamental',
    description: 'Company research, statements, watchlists and AI reports.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M14 7h7v7" />
        <path d="M4 20h16" />
      </svg>
    ),
    link: '/fundakamental',
  },
  {
    title: 'Journal',
    description: 'Daily market insights and analysis.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
      </svg>
    ),
    link: '/journal',
  },
  {
    title: 'Newsletter',
    description: 'Weekly market updates & insights.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="14" rx="2"/>
        <path d="M3 7l9 6 9-6"/>
      </svg>
    ),
    link: '/newsletter',
  },
];

const ToolsSection = () => {
  return (
    <section id="tools" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-display font-semibold text-gray-900 mb-4 tracking-[-0.025em]">
            Ecosystem & Tools
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Simple, powerful tools to manage your finances and grow your wealth.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => {
            const Content = (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 ring-1 ring-primary/15 flex items-center justify-center text-brand dark:text-brand flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand transition-colors flex items-center gap-2">
                    {tool.title}
                    <svg className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                </div>
              </div>
            );

            const cardClasses = "group p-6 bg-card rounded-2xl border border-border shadow-sm hover:border-brand-line dark:hover:border-brand hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300";

            return (
              <Link 
                key={index} 
                to={tool.link}
                className={cardClasses}
              >
                {Content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
