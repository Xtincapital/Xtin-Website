# EmailJS Setup Guide for Contact Form

## Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Add Email Service
1. Go to "Email Services" in the dashboard
2. Click "Add New Service"
3. Choose your email provider (Gmail recommended)
4. Connect your Gmail account: **xtinservice@gmail.com**
5. Note down the **Service ID** (something like `service_xxxxxxx`)

## Step 3: Create Email Template
1. Go to "Email Templates" in the dashboard
2. Click "Create New Template"
3. Use this template structure:

**Subject:**
```
New Contact Form Message: {{subject}}
```

**Content:**
```
You have received a new message from your website contact form.

From: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}

Subject: {{subject}}

Message:
{{message}}

---
This message was sent from Xtin Capital website contact form.
```

4. Note down the **Template ID** (something like `template_xxxxxxx`)

## Step 4: Get Public Key
1. Go to "Account" → "General"
2. Find your **Public Key** (something like `xxxxxxxxxxxxxxxxx`)

## Step 5: Update Footer.jsx
Open `src/components/Footer.jsx` and replace these lines (around line 25-27):

```javascript
const serviceId = 'YOUR_SERVICE_ID';      // Replace with your Service ID
const templateId = 'YOUR_TEMPLATE_ID';    // Replace with your Template ID
const publicKey = 'YOUR_PUBLIC_KEY';      // Replace with your Public Key
```

With your actual credentials:
```javascript
const serviceId = 'service_xxxxxxx';      // Your actual Service ID
const templateId = 'template_xxxxxxx';    // Your actual Template ID
const publicKey = 'xxxxxxxxxxxxxxxxx';    // Your actual Public Key
```

## Step 6: Test the Form
1. Save the file
2. Open your website
3. Click "Help Center" in the footer
4. Fill out the contact form
5. Submit and check your email: **xtinservice@gmail.com**

## Gmail Configuration (Important!)
If using Gmail, you may need to:
1. Enable 2-factor authentication on your Gmail account
2. Create an "App Password" for EmailJS
3. Use the app password when connecting Gmail to EmailJS

## Free Tier Limits
- 200 emails per month
- Perfect for a contact form
- No credit card required

## Alternative: Web3Forms (Easier Setup)
If you want an even simpler solution without account setup, I can switch to Web3Forms which only requires an API key.

---
**Need Help?** Contact EmailJS support or check their documentation at https://www.emailjs.com/docs/
