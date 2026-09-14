#!/usr/bin/env node

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔧 Testing SMTP Connection...\n');

// Create transporter with improved configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    connectionTimeout: 60000, // 60 seconds connection timeout
    greetingTimeout: 30000,   // 30 seconds greeting timeout
    socketTimeout: 60000,     // 60 seconds socket timeout
    pool: true,               // Enable connection pooling
    maxConnections: 5,        // Maximum connections to keep alive
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    debug: true, // Enable debug logging
    logger: true // Enable detailed logging
});

console.log('Configuration:');
console.log(`- Host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
console.log(`- Port: ${parseInt(process.env.EMAIL_PORT) || 587}`);
console.log(`- User: ${process.env.EMAIL_USER}`);
console.log(`- Secure: ${process.env.EMAIL_SECURE === 'true' || false}`);
console.log('');

try {
    console.log('⏳ Verifying SMTP connection...');
    const verified = await transporter.verify();
    
    if (verified) {
        console.log('✅ SMTP connection verified successfully!');
        
        // Test sending a simple email
        console.log('\n⏳ Testing email send...');
        const testEmail = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: 'surajnandan78@gmail.com', // Test with your email
            subject: 'SMTP Test - Newsletter System',
            html: `
                <h2>SMTP Connection Test</h2>
                <p>This is a test email to verify SMTP connectivity.</p>
                <p>Time: ${new Date().toISOString()}</p>
                <p>Status: ✅ Connection Working</p>
            `
        };
        
        const info = await transporter.sendMail(testEmail);
        console.log('✅ Test email sent successfully!');
        console.log(`Message ID: ${info.messageId}`);
        console.log(`Response: ${info.response}`);
        
    } else {
        console.log('❌ SMTP verification failed');
    }
} catch (error) {
    console.error('❌ SMTP connection failed:');
    console.error(`Error type: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Error code: ${error.code || 'N/A'}`);
    console.error(`Error command: ${error.command || 'N/A'}`);
    
    if (error.code === 'ETIMEDOUT') {
        console.log('\n💡 Troubleshooting suggestions:');
        console.log('- Check internet connectivity');
        console.log('- Verify firewall settings');
        console.log('- Confirm Gmail "Less secure app access" or use App Password');
        console.log('- Try different SMTP settings (port 465 with secure=true)');
    }
} finally {
    // Close the connection pool
    transporter.close();
    console.log('\n🔚 Connection pool closed');
}