const express = require('express');
const { downdetector } = require('downdetector-api');

const app = express();

let data = {}; // Variable to hold the fetched data

// Function to fetch data from your script for a given service and country
async function fetchData(service, country) {
  try {
    const response = await downdetector(service, country);
    // Update data variable with the latest entry for the specific service
    data[service] = response.reports.length ? response.reports[0] : null;
    console.log(`[${new Date().toISOString()}] Data fetched successfully for ${service}.`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error fetching data for ${service}:`, err);
  }
}

// Call the fetchData function for each service initially and then every hour (3600 seconds)
async function fetchAllData(services, country) {
  for (const service of services) {
    await fetchData(service, country);
  }
}

const INTERVAL_SECONDS = process.env.FETCH_INTERVAL_SECONDS || 3600; // Fetch interval in seconds, default to 1 hour if not provided
const INTERVAL_MILLISECONDS = INTERVAL_SECONDS * 1000; // Convert seconds to milliseconds

const COUNTRY = process.env.COUNTRY || 'nl'; // Default country is the Netherlands (nl)

fetchAllData(process.env.MEASURE_SERVICE.split(','), COUNTRY); // Fetch data for all services listed in the environment variable initially
setInterval(() => fetchAllData(process.env.MEASURE_SERVICE.split(','), COUNTRY), INTERVAL_MILLISECONDS); // Fetch data for all services listed in the environment variable based on the interval

// Route for /metrics endpoint
app.get('/metrics', (req, res) => {
  let metrics = '';
  for (const service in data) {
    if (data[service]) {
      metrics += `# HELP ${service}_reports Number of reports for ${service}\n`;
      metrics += `# TYPE ${service}_reports gauge\n`;
      metrics += `${service}_reports{date="${data[service].date}", value="${data[service].value}"} ${data[service].value}\n`;
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
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server is running on port ${PORT}`);
});
