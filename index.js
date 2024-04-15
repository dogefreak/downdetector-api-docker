const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

/**
 * Call Downdetector website and get the page content
 * @param {String} company Company to get the data for
 * @param {String} domain Domain suffix of downdetector website (eg: com)
 * @return {String} The page content
 */
async function callDowndetector(company, domain) {
  var url = (domain === "nl" || domain === "be") ? "allestoringen" : "downdetector";
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  // eslint-disable-next-line max-len
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36');
  await page.goto(`https://${url}.${domain}/status/${company}/`);
  const content = await page.content();
  await browser.close();
  return content;
}

// New one to fix memory leak
async function callDowndetectorNew(company, domain) {
  let stdoutData = '';

  return new Promise((resolve, reject) => {
    const proc = spawn('node', [
      path.resolve(__dirname, 'puWorker.js'),
      `--company=${company}`,
      `--domain=${domain}`,
    ], { shell: false });

    proc.stdout.on('data', (data) => {
      stdoutData += data;
    });

    proc.stderr.on('data', (data) => {
      console.error(`NodeERR: ${data}`);
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Child process exited with code ${code}`));
      }
    });

    proc.on('exit', () => {
      proc.kill();
      resolve(stdoutData);
    });
  });
}

/**
 * Get the script tag content from the Downdetector page content
 * @param {String} data Page content
 * @return {String} The content of the script tag
 */
function getScriptContent(data) {
  const $ = cheerio.load(data);
  const scriptElems = $('script[type="text/javascript"]');
  let res = { reports: [], baseline: [] };
  for (const script of scriptElems) {
    if (script.children?.[0]?.data.includes('{ x:')) {
      const scriptContent = script.children[0]?.data;
      const chartPoints = getChartPointsString(scriptContent);
      const { reports, baseline } = getChartPointsObject(chartPoints);
      res.reports.push(reports[reports.length - 1]);
      res.baseline.push(baseline[baseline.length - 1]);
      break;
    }
  }
  return res;
}

/**
 * Get array of data from a string
 * @param {String} scriptContent Script content as a string
 * @return {Array} Array of strings each one containing a pair of data
 */
function getChartPointsString(scriptContent) {
  return scriptContent.split('\n')
      .map((line) => line.trim())
      .filter((line) => line.includes('{ x: \''));
}

/**
 * Convert a string to object with reports and baseline properties
 * @param {String} chartPoints string with dates and values
 * @return {Object} object with reports and baseline properties
 */
function getChartPointsObject(chartPoints) {
  return {
    reports: str2obj(chartPoints.slice(0, 96)),
    baseline: str2obj(chartPoints.slice(96, 192)),
  };
}

/**
 * Convert a string to object with date and value properties
 * @param {String} chartPoints string to convert to object
 * @return {Object} object with date and value properties
 */
function str2obj(chartPoints) {
  return chartPoints
      .map((line) => line
          .replace(/\{ | \},|'/g, '')
          .split('x: ').pop()
          .split(', y: '))
      .map((tuple) => ({ date: tuple[0], value: +tuple[1] }));
}

/**
 * Get data from Downdetector
 * @param {string} company Company name in Downdetector (see URL)
 * @param {string} [domain] Downdetector domain to use (default is 'com')
 */
async function downdetector(company, domain = 'com') {
  try {
    if (!company || (typeof company) !== 'string') {
      throw Error('Invalid input');
    }
    const data = await callDowndetectorNew(company, domain);
    const scriptContent = getScriptContent(data);
    return JSON.stringify(scriptContent); // Convert object to JSON string
  } catch (err) {
    console.error(err.message);
  }
}

exports.downdetector = downdetector;
