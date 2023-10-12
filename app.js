const express = require('express');
const { PORT } = require('./config');
const fs = require('fs');
const readline = require('readline');

const app = express();
app.use(express.json());

// Middleware for validating parameters in the request
function validateParameters(req, res, next) {
  const n = parseInt(req.query.n);
  const filename = req.params.filename;
  const filter = req.query.filter || '';

  // Check if the 'n' parameter is a positive integer
  if (isNaN(n) || n <= 0) {
    return res.status(400).send("Invalid or missing 'n' parameter.");
  }

  // Check if the 'filename' parameter is provided
  if (!filename) {
    return res.status(400).send("Invalid or missing 'filename' parameter.");
  }

  req.logParams = { n, filename, filter };
  next();
}

app.get('/listLogs/:filename', validateParameters, async (request, response) => {
  const { n, filename, filter } = request.logParams;

  const filePath = `/var/log/${filename}.log`;

  if (!fs.existsSync(filePath)) {
    return response.status(404).send('Log file not found.');
  }

  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const filteredLines = [];

  // Listen for each line in the log file
  rl.on('line', (line) => {
    // Check if the line includes the filter text
    if (line.includes(filter)) {
      filteredLines.push(line);

      // Remove the oldest line if more than N lines are found
      if (filteredLines.length > n) {
        filteredLines.shift();
      }
    }
  });

  // When the file reading is complete, send the last N lines
  rl.on('close', () => {
    // Reverse the filteredLines array
    const reversedLines = filteredLines.reverse();

    const lastNLines = reversedLines.join('\n');

    // Log the number of lines returned
    console.log(`Number of lines returned: ${reversedLines.length}`);

    // Send the last N lines as the response
    response.send(lastNLines);
  });
});

app.listen(PORT, () => {
  console.log('Server Listening on PORT:', PORT);
});

module.exports = app;

