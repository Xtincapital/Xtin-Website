import { HTTP_STATUS, MESSAGES } from '../../constants/constants.js';
import { validateContactForm } from './help.validator.js';
import { createSupportTicket } from './help.repository.js';

// Submit help center contact form
const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'Missing required fields: name, email, subject, message',
        data: null
      });
    }

    // Length validation
    if (name.trim().length < 2) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'Name must be at least 2 characters long',
        data: null
      });
    }

    if (subject.trim().length < 5) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'Subject must be at least 5 characters long',
        data: null
      });
    }

    if (message.trim().length < 10) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'Message must be at least 10 characters long',
        data: null
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'Invalid email format',
        data: null
      });
    }

    // Save to database
    let data;
    try {
      data = await createSupportTicket({
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : null,
        subject: subject.trim(),
        message: message.trim()
      });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'Failed to save contact form submission',
        data: null
      });
    }

    res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: 'Contact form submitted successfully',
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        subject: data.subject,
        created_at: data.created_at
      }
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: MESSAGES.SERVER_ERROR,
      data: null
    });
  }
};

export { submitContactForm };