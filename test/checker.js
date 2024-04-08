// Script to check if downdetector-api packages was properly installed.
  
const { downdetector } = require('downdetector-api');

async function main () {
  try {
    // Without specifying the downdetector domain
    // const response = await downdetector('steam');
    // Specifying the downdetector domain (some companies are not in the .com domain)
    const response = await downdetector('ziggo', 'nl');
    console.log("Response: " + response);
    console.log('Data: ' + JSON.stringify(response));
    // console.log("Hello!")
  } catch (err) {
    console.error(err);
  }
}

main();
