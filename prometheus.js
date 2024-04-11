const express = require('express');
const { downdetector } = require('downdetector-api');
const { exec } = require('child_process');

const app = express();

let reports = {}; // Variable to hold the fetched reports data
let baseline = {}; // Variable to hold the fetched baseline data

// Function to format the date for logs
function formatLogDate(date) {
  return date.toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' }); // Adjust timeZone as per your requirement
}

// Function to fetch data for all services
async function fetchAllData(services, country) {
  try {
    for (const service of services) {
      const response = await downdetector(service, country);
      // Update data variables with the latest entries for the specific service
      reports[service] = response.reports.length ? response.reports[0] : null;
      baseline[service] = response.baseline.length ? response.baseline[0] : null;
      console.log(`[${formatLogDate(new Date())}] Data fetched successfully: ${service}`);
    }
  } catch (err) {
    if (err.code === 'ENOTFOUND' || err instanceof TypeError) {
      console.error(`[${formatLogDate(new Date())}] Error fetching data:`, err.message);
      console.log(`[${formatLogDate(new Date())}] Retrying data fetch in the next interval.`);
    } else if (err.message.includes('Failed to launch the browser process')) {
      console.error(`[${formatLogDate(new Date())}] Error fetching data:`, err.message);
      restartScript();
    } else {
      console.error(`[${formatLogDate(new Date())}] Unexpected error occurred:`, err);
      restartScript();
    }
  }
}

// Function to restart the script
function restartScript() {
  console.log(`[${formatLogDate(new Date())}] Restarting the script...`);
  exec('prometheus.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`[${formatLogDate(new Date())}] Error restarting script:`, error);
      return;
    }
    console.log(`[${formatLogDate(new Date())}] Script restarted successfully.`);
  });
}

// Function to get environment variables with defaults
function getEnvVariables() {
  return {
    PORT: process.env.PORT || 3333,
    MEASURE_SERVICE: (process.env.MEASURE_SERVICE || 'github').split(','),
    COUNTRY: process.env.COUNTRY || 'nl',
    INTERVAL_MILLISECONDS: (process.env.INTERVAL || 900) * 1000 // Convert seconds to milliseconds
  };
}

app.get('/metrics', (req, res) => {
  let metrics = '';
  metrics += `# HELP downdetector_reports Number of reports for all Services\n`;
  metrics += `# TYPE downdetector_reports gauge\n`;
  for (const service in reports) {
    if (reports[service]) {
      metrics += `downdetector_reports{name="${service.charAt(0).toUpperCase() + service.slice(1)}"} ${reports[service].value}\n`;
    }
  }
  metrics += '\n'; // Add a blank line before baseline metrics
  metrics += `# HELP downdetector_baseline Baseline value for all Services\n`;
  metrics += `# TYPE downdetector_baseline gauge\n`;
  for (const service in baseline) {
    if (baseline[service]) {
      metrics += `downdetector_baseline{name="${service.charAt(0).toUpperCase() + service.slice(1)}"} ${baseline[service].value}\n`;
    }
  }
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

// Catch-all route to redirect all requests to /metrics endpoint
app.use((req, res) => {
  res.redirect('/metrics');
});

// Start the Express.js server
const { PORT, MEASURE_SERVICE, COUNTRY, INTERVAL_MILLISECONDS } = getEnvVariables();
app.listen(PORT, () => {
  console.log(`[${formatLogDate(new Date())}] Server is running on port: ${PORT}\n` +
              `[${formatLogDate(new Date())}] Downdetector website: ${COUNTRY}\n` +
              `[${formatLogDate(new Date())}] Services being measured: ${MEASURE_SERVICE.join(', ')}\n` +
              `[${formatLogDate(new Date())}] Measurement interval: ${INTERVAL_MILLISECONDS / 1000} seconds`);
  
  // Fetch data initially
  fetchAllData(MEASURE_SERVICE, COUNTRY);
  
  // Fetch data based on the interval
  setInterval(() => fetchAllData(MEASURE_SERVICE, COUNTRY), INTERVAL_MILLISECONDS);
});
