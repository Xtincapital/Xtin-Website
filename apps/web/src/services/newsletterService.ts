import authService from './authService';
import { BACKEND_URL } from '../config/env';

class NewsletterService {
  // Get all newsletters
  async getAllNewsletters() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/newsletters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch newsletters');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get newsletters error:', error);
      throw new Error(error.message || 'Failed to fetch newsletters');
    }
  }

  // Get specific newsletter by ID
  async getNewsletterById(id) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/newsletters/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch newsletter');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get newsletter error:', error);
      throw new Error(error.message || 'Failed to fetch newsletter');
    }
  }

  // Get all Indian Finance newsletters
  async getAllIndianFinanceNewsletters() {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${BACKEND_URL}/api/indian-finance-newsletters`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: Failed to fetch Indian Finance newsletters`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Get Indian Finance newsletters error:', error);
      throw new Error(error.message || 'Failed to fetch Indian Finance newsletters');
    }
  }

  // Get specific Indian Finance newsletter by ID
  async getIndianFinanceNewsletterById(id) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/indian-finance-newsletters/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch Indian Finance newsletter');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get Indian Finance newsletter error:', error);
      throw new Error(error.message || 'Failed to fetch Indian Finance newsletter');
    }
  }

  // Get all Substack articles (archive)
  async getSubstackArticles() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/substack/articles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch Substack articles');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get Substack articles error:', error);
      throw new Error(error.message || 'Failed to fetch Substack articles');
    }
  }

  // Get a single Substack article (full body) by slug
  async getSubstackArticleBySlug(slug) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/substack/articles/${encodeURIComponent(slug)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch Substack article');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get Substack article error:', error);
      throw new Error(error.message || 'Failed to fetch Substack article');
    }
  }

  // Subscribe to newsletter (optionally with market preferences: ['IN','US'])
  async subscribeToNewsletter(email, markets?) {
    try {
      const body: { email: string; markets?: string } = { email };
      if (Array.isArray(markets) && markets.length) body.markets = markets.join(',');
      const response = await fetch(`${BACKEND_URL}/api/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (_parseError) {
        responseData = null;
      }

      if (!response.ok) {
        throw new Error(responseData?.message || responseData?.error || 'Failed to subscribe');
      }

      return responseData?.data;
    } catch (error) {
      console.error('Subscribe newsletter error:', error);
      throw new Error(error.message || 'Failed to subscribe to newsletter');
    }
  }
}

export default new NewsletterService();