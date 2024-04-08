const express = require('express');
const { downdetector } = require('downdetector-api');

const app = express();

let data = {}; // Variable to hold the fetched data

// Function to fetch data from your script for a given service
async function fetchData(service) {
  try {
    const response = await downdetector(service, 'nl');
    data[service] = response; // Update data variable with the fetched response for the specific service
    console.log(`Data fetched successfully for ${service}.`);
  } catch (err) {
    console.error(`Error fetching data for ${service}:`, err);
  }
}

// Call the fetchData function for each service initially and then every hour (3600000 milliseconds)
async function fetchAllData(services) {
  for (const service of services) {
    await fetchData(service);
  }
}

const INTERVAL = process.env.FETCH_INTERVAL || 3600000; // Fetch interval in milliseconds, default to 1 hour if not provided

fetchAllData(process.env.MEASURE_SERVICE.split(',')); // Fetch data for all services listed in the environment variable initially
setInterval(() => fetchAllData(process.env.MEASURE_SERVICE.split(',')), INTERVAL); // Fetch data for all services listed in the environment variable based on the interval

// Route for /metrics endpoint
app.get('/metrics', (req, res) => {
  let metrics = '';
  for (const service in data) {
    metrics += `
      # HELP ${service}_outages Number of outages reported for ${service}
      # TYPE ${service}_outages gauge
      ${data[service].reports.map(report => `${service}_outages{date="${report.date}", value="${report.value}"} ${report.value}`).join('\n')}
    `;
  }
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

// Disable the root page by not defining any route handler for "/"
// Express will return a 404 Not Found for any request to the root URL

// Start the Express.js server
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
