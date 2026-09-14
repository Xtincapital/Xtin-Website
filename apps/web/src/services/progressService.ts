import authService from './authService';
import { BACKEND_URL } from '../config/env';

class ProgressService {
  /**
   * True when a Supabase session exists. Progress features quietly no-op
   * without one (e.g. dev auth bypass, half-logged-out states) instead of
   * spamming the console with "No authentication session found".
   */
  async hasSession() {
    try {
      const { data: { session } } = await authService.getCurrentSession();
      return !!session;
    } catch {
      return false;
    }
  }

  // Mark a lesson as completed
  async markLessonCompleted(moduleSlug, lessonSlug) {
    if (!(await this.hasSession())) return null;
    try {
      const url = `${BACKEND_URL}/api/progress/complete`;

      const response = await authService.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          module_slug: moduleSlug,
          lesson_slug: lessonSlug,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark lesson as completed');
      }

      const result = await response.json();

      if (result?.data?.certificate?.awarded) {
        window.dispatchEvent(new CustomEvent('certificate_awarded', {
          detail: result.data,
        }));
      }

      return result.data;
    } catch (error) {
      console.error('Mark lesson completed error:', error);
      throw new Error(error.message || 'Failed to mark lesson as completed');
    }
  }

  // Get user's progress for all modules (null when not signed in / offline)
  async getUserProgress() {
    if (!(await this.hasSession())) return null;
    try {
      const url = `${BACKEND_URL}/api/progress/user`;

      const response = await authService.makeAuthenticatedRequest(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user progress');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.warn('Get user progress unavailable:', error.message);
      return null;
    }
  }

  // Get progress for a specific module
  async getModuleProgress(moduleSlug) {
    try {
      const url = `${BACKEND_URL}/api/progress/module/${moduleSlug}`;

      const response = await authService.makeAuthenticatedRequest(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch module progress');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get module progress error:', error);
      throw new Error(error.message || 'Failed to fetch module progress');
    }
  }

  // Check if a specific lesson is completed
  async checkLessonCompleted(moduleSlug, lessonSlug) {
    try {
      const url = `${BACKEND_URL}/api/progress/check/${moduleSlug}/${lessonSlug}`;

      const response = await authService.makeAuthenticatedRequest(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check lesson completion');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Check lesson completed error:', error);
      throw new Error(error.message || 'Failed to check lesson completion');
    }
  }

  // Get detailed completion summary for certificate modules
  async getLearnCompletionSummary() {
    try {
      const url = `${BACKEND_URL}/api/progress/learn-summary`;

      const response = await authService.makeAuthenticatedRequest(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch learn completion summary');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get learn completion summary error:', error);
      throw new Error(error.message || 'Failed to fetch learn completion summary');
    }
  }

  // Calculate progress percentage for a module
  calculateModuleProgress(completedLessons, totalLessons) {
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
  }
}

export default new ProgressService();