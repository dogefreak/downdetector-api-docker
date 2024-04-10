const express = require('express');
const { downdetector } = require('downdetector-api');

const app = express();

let data = {}; // Variable to hold the fetched data

// Function to format the date for logs
function formatLogDate(date) {
  return date.toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' }); // Adjust timeZone as per your requirement
}

// Function to fetch data for all services
async function fetchAllData(services, country) {
  try {
    for (const service of services) {
      const response = await downdetector(service, country);
      // Update data variable with the latest entry for the specific service
      data[service] = response.reports.length ? response.reports[0] : null;
      console.log(`[${formatLogDate(new Date())}] Data fetched successfully for ${service}.`);
    }
  } catch (err) {
    console.error(`[${formatLogDate(new Date())}] Error fetching data:`, err);
  }
}

// Function to get environment variables with defaults
function getEnvVariables() {
  return {
    PORT: process.env.PORT || 3333,
    FETCH_INTERVAL_SECONDS: process.env.INTERVAL|| 900,
    MEASURE_SERVICE: process.env.MEASURE_SERVICE || 'github',
    COUNTRY: process.env.COUNTRY || 'nl'
  };
}

// Route for /metrics endpoint
app.get('/metrics', (req, res) => {
  let metrics = '';
  for (const service in data) {
    if (data[service]) {
      metrics += `# HELP ${service}_reports Number of reports for ${service}\n`;
      metrics += `# TYPE ${service}_reports gauge\n`;
      metrics += `${service}_reports ${data[service].value}\n`;
      metrics += '\n'; // Add a blank line after each service's metrics
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
const { PORT, FETCH_INTERVAL_SECONDS, MEASURE_SERVICE, COUNTRY } = getEnvVariables();
app.listen(PORT, () => {
  console.log(`[${formatLogDate(new Date())}] Server is running on port ${PORT}`);
  console.log(`[${formatLogDate(new Date())}] Environment variables:`);
  console.log(`Interval: ${FETCH_INTERVAL_SECONDS}`);
  console.log(`Measure Services: ${MEASURE_SERVICE}`);
  console.log(`Country: ${COUNTRY}`);
  
  // Fetch data initially
  fetchAllData(MEASURE_SERVICE.split(','), COUNTRY);
  
  // Fetch data based on the interval
  const INTERVAL_MILLISECONDS = FETCH_INTERVAL_SECONDS * 1000; // Convert seconds to milliseconds
  setInterval(() => fetchAllData(MEASURE_SERVICE.split(','), COUNTRY), INTERVAL_MILLISECONDS);
});
