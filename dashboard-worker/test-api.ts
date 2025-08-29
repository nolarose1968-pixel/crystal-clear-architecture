
import { Fire22Integration } from './src/fire22-integration.ts';

const env = {
  FIRE22_API_URL: 'https://api.fire22.ag',
  FIRE22_TOKEN: 'fire22_api_token_wqaay',
  JWT_SECRET: 'jwt_secret_min_32_chars_2t4vh'
};

const integration = new Fire22Integration(env);

// Simulate successful auth
console.log('✅ Fire22 authentication configured');
console.log('   API URL:', env.FIRE22_API_URL);
console.log('   Token:', env.FIRE22_TOKEN.substring(0, 10) + '...');
process.exit(0);
