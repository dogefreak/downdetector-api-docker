const puppeteer = require('puppeteer');
// WARNING: don't use console.log here for debug, use console.error instead. STDOUT is used to deliver output data

// Get command line arguments for company and domain
const companyArgIndex = process.argv.findIndex(arg => arg.startsWith('--company='));
const domainArgIndex = process.argv.findIndex(arg => arg.startsWith('--domain='));

if (companyArgIndex === -1 || domainArgIndex === -1) {
  console.error('Missing command line arguments.');
  process.exit(1);
}

const company = process.argv[companyArgIndex].split('=')[1];
const domain = process.argv[domainArgIndex].split('=')[1];

async function runPuppeteer(company, domain) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  const url = (domain === 'nl' || domain === 'be') ? 'allestoringen' : 'downdetector';
  const pageUrl = `https://${url}.${domain}/status/${company}/`;

  await page.goto(pageUrl, { waitUntil: 'networkidle2' });

  const content = await page.content();

  await page.close();
  await browser.close();

  return content;
}

runPuppeteer(company, domain)
  .then((content) => {
    console.log(content); // Print out data to STDOUT
  })
  .catch((error) => {
    console.error('Error during Puppeteer operation:', error);
    process.exit(1);
  });
