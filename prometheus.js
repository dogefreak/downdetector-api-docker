const express = require('express');
const { downdetector } = require('downdetector-api');

const app = express();

let data = {}; // Variable to hold the fetched data

// Function to fetch data from your script for a given service and country
async function fetchData(service, country) {
  try {
    const response = await downdetector(service, country);
    data[service] = response; // Update data variable with the fetched response for the specific service
    console.log(`Data fetched successfully for ${service}.`);
  } catch (err) {
    console.error(`Error fetching data for ${service}:`, err);
  }
}

// Call the fetchData function for each service initially and then every hour (3600 seconds)
async function fetchAllData(services, country) {
  for (const service of services) {
    await fetchData(service, country);
  }
}

const INTERVAL_SECONDS = process.env.FETCH_INTERVAL_SECONDS || 900; // Fetch interval in seconds, default to 1 hour if not provided
const INTERVAL_MILLISECONDS = INTERVAL_SECONDS * 1000; // Convert seconds to milliseconds

const COUNTRY = process.env.COUNTRY || 'nl'; // Default country is the Netherlands (nl)

fetchAllData(process.env.MEASURE_SERVICE.split(','), COUNTRY); // Fetch data for all services listed in the environment variable initially
setInterval(() => fetchAllData(process.env.MEASURE_SERVICE.split(','), COUNTRY), INTERVAL_MILLISECONDS); // Fetch data for all services listed in the environment variable based on the interval

// Route for /metrics endpoint
app.get('/metrics', (req, res) => {
  const services = Object.keys(data);
  const metrics = services.map((service, index) => {
    let metricsString = '';
    metricsString += `# HELP ${service}_reports Number of reports for ${service}\n`;
    metricsString += `# TYPE ${service}_reports gauge\n`;
    metricsString += data[service].reports.map(report => `${service}_reports{date="${report.date}", value="${report.value}"} ${report.value}`).join('\n');
    if (index !== services.length - 1) {
      metricsString += '\n'; // Add a blank line if it's not the last service
    }
    return metricsString;
  }).join('\n');

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
  console.log(`Server is running on port ${PORT}`);
});
