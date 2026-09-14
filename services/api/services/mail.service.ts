import nodemailer from 'nodemailer';

// SMTP-only mode (Google/Gmail)
const useSmtp = process.env.EMAIL_USER && process.env.EMAIL_PASS;
if (!useSmtp) {
  console.warn('Warning: SMTP is not configured. Set EMAIL_USER and EMAIL_PASS for Gmail sending.');
}

// Create SMTP transporter if credentials are available
let smtpTransporter = null;
if (useSmtp) {
  smtpTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,    connectionTimeout: 60000, // 60 seconds connection timeout
    greetingTimeout: 30000,   // 30 seconds greeting timeout
    socketTimeout: 60000,     // 60 seconds socket timeout
    pool: true,               // Enable connection pooling
    maxConnections: 5,        // Maximum connections to keep alive
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const htmlToText = (html = '') =>
  String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

const buildUnsubscribeHeaders = (to) => {
  const supportEmail = process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER || 'support@xtincapital.com';
  const backendUrl = process.env.BACKEND_URL || '';
  const unsubscribeMailto = `<mailto:${supportEmail}?subject=Unsubscribe%20${encodeURIComponent(to)}>`;
  const unsubscribeUrl = backendUrl
    ? `<${backendUrl}/api/subscribers/unsubscribe?email=${encodeURIComponent(to)}>`
    : null;

  return {
    'List-Unsubscribe': unsubscribeUrl ? `${unsubscribeMailto}, ${unsubscribeUrl}` : unsubscribeMailto,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    'Precedence': 'bulk',
    'X-Auto-Response-Suppress': 'OOF, AutoReply',
  };
};

/**
 * Send email using SMTP (Google/Gmail)
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const text = htmlToText(html);
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@xtincapital.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'Xtin Capital';
    const replyTo = process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER || fromAddress;
    const headers = buildUnsubscribeHeaders(to);

    if (useSmtp && smtpTransporter) {
      try {
        const info = await smtpTransporter.sendMail({
          from: `${fromName} <${fromAddress}>`,
          to,
          replyTo,
          subject,
          html,
          text,
          headers,
        });
        console.log(`Email sent via SMTP: ${to} (${info.messageId})`);
        return { success: true, service: 'smtp' };
      } catch (smtpError) {
        console.warn(`SMTP failed for ${to}: ${smtpError.message}`);
        throw smtpError;
      }
    }

    throw new Error('SMTP email service is not configured');
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
    throw error;
  }
};

/**
 * Send email to multiple recipients with rate limiting
 */
export const sendEmailToAll = async (emails, subject, html) => {
  console.log(`[Email Service] Starting to send ${emails.length} emails...`);
  let successCount = 0;
  let failCount = 0;
  
  // Send emails sequentially with delay to avoid rate limiting
  for (const email of emails) {
    try {
      await sendEmail(email, subject, html);
      successCount++;
      console.log(`✓ Successfully sent to ${email}`);
      
      // Add delay between emails (1 second)
      if (emails.indexOf(email) < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      failCount++;
      console.error(`✗ Failed to send to ${email}:`, error.message);
    }
  }
  
  console.log(`[Email Service] Completed: ${successCount} success, ${failCount} failed`);
  return { successCount, failCount };
};