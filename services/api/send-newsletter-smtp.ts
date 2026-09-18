import nodemailer from 'nodemailer';
import supabase from './supabase/index.js';

console.log('\n========================================');
console.log('🚀 Starting Newsletter Distribution');
console.log('========================================\n');

try {
	// Test SMTP connection
	console.log('Testing SMTP connection...');
	const transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST || 'smtp.gmail.com',
		port: parseInt(process.env.EMAIL_PORT) || 587,
		secure: process.env.EMAIL_SECURE === 'true' || false,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	await transporter.verify();
	console.log('✓ SMTP connection verified\n');

	// Fetch latest newsletter
	console.log('Fetching latest newsletter...');
	const { data, error } = await supabase
		.from('indian_finance_newsletter')
		.select('*')
		.order('created_at', { ascending: false })
		.limit(1);

	if (error) {
		throw new Error(`Database error: ${error.message}`);
	}

	if (!data || data.length === 0) {
		throw new Error('No newsletters found in database. Please generate a newsletter first.');
	}

	const newsletter = data[0];
	console.log(`✓ Found newsletter: "${newsletter.title}"`);
	console.log(`  Created: ${new Date(newsletter.created_at).toLocaleString()}\n`);

	// Fetch all subscribers
	console.log('Fetching subscribers...');
	const { data: subscribers, error: subError } = await supabase
		.from('newsletter_subscribers')
		.select('*');

	if (subError) {
		throw new Error(`Subscriber fetch error: ${subError.message}`);
	}

	if (!subscribers || subscribers.length === 0) {
		console.log('⚠️ No subscribers found');
		process.exit(0);
	}

	console.log(`✓ Found ${subscribers.length} subscriber(s):`);
	subscribers.forEach((sub, index) => {
		console.log(`   ${index + 1}. ${sub.email}`);
	});
	console.log();

	// Generate HTML email
	const generateHTML = (newsletter) => {
		let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newsletter.title}</title>
    <style>
        @import url('https://api.fontshare.com/v2/css?f[]=trench-slab@500&f[]=general-sans@400&display=swap');
        
        * {
            font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Trench Slab', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        body { 
            font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            background-color: #f9fafb; 
            margin: 0; 
            padding: 20px 0; 
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            padding: 40px; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px; 
        }
        .title { 
            font-family: 'Trench Slab', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 36px; 
            font-weight: 500; 
            color: #111827; 
            text-align: center; 
            margin-bottom: 20px; 
            border-bottom: 3px solid #059669; 
            padding-bottom: 20px; 
        }
        .date { 
            font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px; 
            color: #6b7280; 
            text-align: center; 
            margin-bottom: 40px; 
        }
        .heading { 
            font-family: 'Trench Slab', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 24px; 
            font-weight: 500; 
            color: #1f2937; 
            margin-bottom: 20px; 
            border-bottom: 2px solid #059669; 
            padding-bottom: 10px; 
            margin-top: 40px; 
        }
        .subheading { 
            font-family: 'Trench Slab', -apple-system, BlinkMacSystemFont, 'Segue UI', sans-serif;
            font-size: 18px; 
            font-weight: 500; 
            color: #374151; 
            margin-bottom: 10px; 
            margin-top: 30px; 
        }
        .content { 
            font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 16px; 
            font-weight: 400;
            line-height: 1.6; 
            color: #4b5563; 
            text-align: justify;
            margin-bottom: 30px; 
        }
        .footer { 
            font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin-top: 60px; 
            padding-top: 30px; 
            border-top: 1px solid #e5e7eb; 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">${newsletter.title}</h1>
        <p class="date">${new Date(newsletter.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>`;

		for (let i = 1; i <= 5; i++) {
			const heading = newsletter[`heading_${i}`];
			if (heading) {
				html += `<h2 class="heading">${heading}</h2>`;
				for (let j = 1; j <= 5; j++) {
					const subheading = newsletter[`heading_${i}_subheading_${j}`];
					const content = newsletter[`heading_${i}_subheading_${j}_content`];
					if (subheading && content) {
						html += `<h3 class="subheading">${subheading}</h3><p class="content">${content}</p>`;
					}
				}
			}
		}

		html += `<div class="footer"><p>Xtin Capital - Financial News Made Simple</p><p>Stay informed with the latest Indian finance insights.</p><p>© ${new Date().getFullYear()} Xtin Capital. All rights reserved.</p></div></div></body></html>`;
		return html;
	};

	const emailHTML = generateHTML(newsletter);

	// Send newsletters
	console.log('📧 Sending newsletter...\n');
	let successCount = 0;
	let failCount = 0;
	const failedEmails = [];

	for (const subscriber of subscribers) {
		try {
			const info = await transporter.sendMail({
				from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
				to: subscriber.email,
				subject: newsletter.title,
				html: emailHTML,
			});
			console.log(`✓ Email sent to ${subscriber.email}`);
			successCount++;
			// Rate limiting: 0.5s delay between emails
			await new Promise(resolve => setTimeout(resolve, 500));
		} catch (emailError) {
			console.error(`✗ Failed to send to ${subscriber.email}: ${emailError.message}`);
			failCount++;
			failedEmails.push({ email: subscriber.email, error: emailError.message });
		}
	}

	transporter.close();

	// Summary
	console.log('\n========================================');
	console.log('📊 Distribution Summary');
	console.log('========================================');
	console.log(`✓ Successful: ${successCount}/${subscribers.length}`);
	if (failCount > 0) {
		console.log(`✗ Failed: ${failCount}`);
		failedEmails.forEach(f => {
			console.log(`   - ${f.email}: ${f.error}`);
		});
	}
	console.log(`Timestamp: ${new Date().toISOString()}`);
	console.log('========================================\n');

	process.exit(failCount > 0 ? 1 : 0);

} catch (error) {
	console.error('\n❌ Newsletter distribution failed:');
	console.error(`Error: ${error.message}`);
	console.error('========================================\n');
	process.exit(1);
}
