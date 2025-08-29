const fs = require('fs');
const path = require('path');

try {
  const constantsPath = path.join(__dirname, 'src/types/fire22-otc-constants.ts');
  const content = fs.readFileSync(constantsPath, 'utf8');

  // Extract L_KEY_MAPPING
  const lKeyMatch = content.match(/export const L_KEY_MAPPING = ({[\s\S]*?});/);
  if (!lKeyMatch) {
    console.log('❌ Could not find L_KEY_MAPPING in constants file');
    process.exit(1);
  }

  // Simple parsing to count L-keys
  const mappingContent = lKeyMatch[1];
  const lKeyCount = (mappingContent.match(/L\d{3}:/g) || []).length;

  console.log('🔍 L-Key Mapping Analysis');
  console.log('!==!==!==!====');
  console.log('Total L-keys defined:', lKeyCount);

  // Current mappings from readiness check
  const currentMappings = {
    'L-603': 'customer_id',
    'L-526': 'customer_name',
    'L-152': 'customer_type',
    'L-69': 'amount',
    'L-627': 'risk_amount',
    'L-628': 'win_amount',
    'L-187': 'balance',
  };

  console.log('Currently configured:', Object.keys(currentMappings).length);
  console.log('Missing mappings:', lKeyCount - Object.keys(currentMappings).length);

  // Extract categories
  const categories = mappingContent.match(/(\w+):\s*{/g);
  if (categories) {
    console.log('\n📊 Categories found:');
    categories.forEach(cat => {
      const categoryName = cat.replace(':', '').trim();
      console.log('  •', categoryName);
    });
  }
} catch (error) {
  console.error('Error:', error.message);
}
