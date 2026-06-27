const { execSync } = require('child_process');
try {
  execSync('npx playwright test tests/e2e/admin-voucher-campaign-recipients.spec.js --project=chromium-desktop', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}
