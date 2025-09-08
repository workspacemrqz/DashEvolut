const { exec } = require('child_process');
const path = require('path');

console.log('🌱 Seeding notification rules...');

// Executar o script de seed
const seedScript = path.join(__dirname, '../server/seed-notification-rules.ts');

exec(`npx tsx "${seedScript}"`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error running seed script:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Warning:', stderr);
  }
  
  console.log('📋 Seed output:');
  console.log(stdout);
  console.log('✅ Seed completed successfully!');
});
