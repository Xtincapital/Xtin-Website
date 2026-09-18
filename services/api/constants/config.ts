import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Application Environment
  PORT: Number(process.env.PORT) || 5000,

  // API and Database URLs
  API_URL: process.env.API_URL || 'http://localhost:5000/api',

  // AI API Keys
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',

  // Cloudinary Credentials
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  CLOUDINARY_URL: process.env.CLOUDINARY_URL || '', 
};

