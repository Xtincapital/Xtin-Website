import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import newsletterService from '../../../services/newsletterService';

// Newsletter reader typography: the site pair (loaded in index.html).
const fontStyleSheet = document.createElement('style');
fontStyleSheet.textContent = `
  .newsletter-display * {
    font-family: 'Inter Tight', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .newsletter-display h1, .newsletter-display h2, .newsletter-display h3, .newsletter-display h4, .newsletter-display h5, .newsletter-display h6 {
    font-family: 'Inter Tight', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-weight: 700; letter-spacing: -0.02em;
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(fontStyleSheet);
}

const NewsletterDisplay = () => {
  const { id } = useParams();
  const [newsletter, setNewsletter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);

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
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', backgroundColor: '#F5F5F7', color: '#1F1F1F' }}>
        {loading ? (
          <p style={{ color: '#717680' }}>Loading newsletter...</p>
        ) : (
          <>
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Newsletter not found</h1>
            <p style={{ color: '#717680', marginBottom: '24px' }}>This edition may have been moved or the link is incorrect.</p>
            <Link to="/newsletter" style={{ backgroundColor: '#16A34A', color: '#ffffff', fontWeight: 700, padding: '10px 20px', borderRadius: '8px' }}>
              Back to Newsletter
            </Link>
          </>
        )}
      </div>
    );
  }

  const renderHeading = (headingNum) => {
    const heading = newsletter[`heading_${headingNum}`];
    if (!heading) return null;

    return (
      <div key={`heading-${headingNum}`} style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontFamily: '"Inter Tight", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: '24px',
          fontWeight: '700',
          color: '#2A2A2C',
          marginBottom: '20px',
          borderBottom: '2px solid #16A34A',
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
                fontFamily: '"Inter Tight", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontSize: '18px',
                fontWeight: '700',
                color: '#373A41',
                marginBottom: '10px'
              }}>
                {subheading}
              </h3>
              <p style={{
                fontFamily: '"Inter Tight", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontSize: '16px',
                fontWeight: '400',
                lineHeight: '1.6',
                color: '#555A63',
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
      fontFamily: '"Inter Tight", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      backgroundColor: '#F5F5F7',
      minHeight: '100vh',
      padding: '20px 0'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        padding: 'clamp(20px, 5vw, 40px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px'
      }}>
        {/* Title */}
        <h1 style={{
          fontFamily: '"Inter Tight", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: '36px',
          fontWeight: '700',
          color: '#1F1F1F',
          textAlign: 'center',
          marginBottom: '20px',
          borderBottom: '3px solid #16A34A',
          paddingBottom: '20px'
        }}>
          {newsletter.title}
        </h1>

        {/* Date */}
        <p style={{
          fontSize: '14px',
          color: '#717680',
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
          borderTop: '1px solid #E4E4EA',
          textAlign: 'center',
          color: '#717680',
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