import { generateAndSendNewsletter } from './utils/newsletterGeneratorSimple.js';

console.log('Starting immediate newsletter generation test...\n');

try {
	const result = await generateAndSendNewsletter();
	console.log('\n✓ Newsletter generation test completed');
	console.log('Result:', JSON.stringify(result, null, 2));
} catch (error) {
	console.error('✗ Newsletter generation test failed');
	console.error('Error:', error.message);
	process.exit(1);
}
