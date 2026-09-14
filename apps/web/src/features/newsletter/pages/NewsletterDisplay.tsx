import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import newsletterService from '../../../services/newsletterService';

// Import fonts from fontshare
const fontStyleSheet = document.createElement('style');
fontStyleSheet.textContent = `
  @import url('https://api.fontshare.com/v2/css?f[]=trench-slab@500&f[]=general-sans@400&display=swap');

  .newsletter-display * {
    font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .newsletter-display h1, .newsletter-display h2, .newsletter-display h3, .newsletter-display h4, .newsletter-display h5, .newsletter-display h6 {
    font-family: 'Trench Slab', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(fontStyleSheet);
}

const NewsletterDisplay = () => {
  const { id } = useParams();
  const [newsletter, setNewsletter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsletter = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await newsletterService.getIndianFinanceNewsletterById(id);
        setNewsletter(data);
      } catch (err) {
        setError('Failed to fetch newsletter: ' + err.message);
        setNewsletter(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNewsletter();
    }
  }, [id]);

  if (!newsletter) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Newsletter not found</div>
      </div>
    );
  }

  const renderHeading = (headingNum) => {
    const heading = newsletter[`heading_${headingNum}`];
    if (!heading) return null;

    return (
      <div key={`heading-${headingNum}`} style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontFamily: 'Trench Slab, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: '24px',
          fontWeight: '500',
          color: '#1f2937',
          marginBottom: '20px',
          borderBottom: '2px solid #059669',
          paddingBottom: '10px'
        }}>
          {heading}
        </h2>
        {Array.from({ length: 5 }, (_, i) => {
          const subNum = i + 1;
          const subheading = newsletter[`heading_${headingNum}_subheading_${subNum}`];
          const content = newsletter[`heading_${headingNum}_subheading_${subNum}_content`];

          if (!subheading || !content) return null;

          return (
            <div key={`sub-${headingNum}-${subNum}`} style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontFamily: 'Trench Slab, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontSize: '18px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '10px'
              }}>
                {subheading}
              </h3>
              <p style={{
                fontFamily: 'General Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontSize: '16px',
                fontWeight: '400',
                lineHeight: '1.6',
                color: '#4b5563',
                textAlign: 'justify'
              }}>
                {content}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="newsletter-display" style={{
      fontFamily: 'General Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      padding: '20px 0'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px'
      }}>
        {/* Title */}
        <h1 style={{
          fontFamily: 'Trench Slab, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: '36px',
          fontWeight: '500',
          color: '#111827',
          textAlign: 'center',
          marginBottom: '20px',
          borderBottom: '3px solid #059669',
          paddingBottom: '20px'
        }}>
          {newsletter.title}
        </h1>

        {/* Date */}
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          {new Date(newsletter.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>

        {/* Render all 5 headings */}
        {Array.from({ length: 5 }, (_, i) => renderHeading(i + 1))}

        {/* Footer */}
        <div style={{
          marginTop: '60px',
          paddingTop: '30px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <p>Xtin Capital - Financial News Made Simple</p>
          <p>Stay informed with the latest Indian finance insights.</p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterDisplay;