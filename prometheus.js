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

// Call the fetchData function for each service initially and then every hour (3600 seconds)
async function fetchAllData(services) {
  for (const service of services) {
    await fetchData(service);
  }
}

const INTERVAL_SECONDS = process.env.FETCH_INTERVAL_SECONDS || 3600; // Fetch interval in seconds, default to 1 hour if not provided
const INTERVAL_MILLISECONDS = INTERVAL_SECONDS * 1000; // Convert seconds to milliseconds

fetchAllData(process.env.MEASURE_SERVICE.split(',')); // Fetch data for all services listed in the environment variable initially
setInterval(() => fetchAllData(process.env.MEASURE_SERVICE.split(',')), INTERVAL_MILLISECONDS); // Fetch data for all services listed in the environment variable based on the interval

// Route for /metrics endpoint
app.get('/metrics', (req, res) => {
  let metrics = '';
  const services = Object.keys(data);

  services.forEach((service, index) => {
    metrics += `# HELP ${service}_reports Number of reports for ${service}\n`;
    metrics += `# TYPE ${service}_reports gauge\n`;
    metrics += data[service].reports.map(report => `${service}_reports{date="${report.date}", value="${report.value}"} ${report.value}`).join('\n');
    
    if (index !== services.length - 1) {
      metrics += '\n'; // Add a blank line if it's not the last service
    }
  });

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
