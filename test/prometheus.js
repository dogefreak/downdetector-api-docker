const express = require('express');
const { downdetector } = require('downdetector-api');

const app = express();

let data = {}; // Variable to hold the fetched data

// Function to fetch data from your script
async function fetchData() {
  try {
    const response = await downdetector('ziggo', 'nl');
    data = response; // Update data variable with the fetched response
    console.log('Data fetched successfully.');
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

// Call the fetchData function initially and then every hour (3600000 milliseconds)
fetchData();
setInterval(fetchData, 3600000);

// Route for /metrics endpoint
app.get('/metrics', (req, res) => {
  // Parse and format data to Prometheus metrics format
  const metrics = `
    # HELP ziggo_outages Number of outages reported for Ziggo
    # TYPE ziggo_outages gauge
    ${data.reports.map(report => `ziggo_outages{date="${report.date}", value="${report.value}"} ${report.value}`).join('\n')}
  `;
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

// Start the Express.js server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
