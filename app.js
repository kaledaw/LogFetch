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

  try {
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
      const lastNLines = filteredLines.join('\n');

      // Log the number of lines returned
      console.log(`Number of lines returned: ${filteredLines.length}`);
      
      // Send the last N lines as the response
      response.send(lastNLines);
    });
  } catch (err) {
    // Check if the error is related to a non-found file
    if (err.code === 'ENOENT') {
      response.status(404).send('Log file not found.');
    } else {
      console.error(err);
      response.status(500).send('Error reading the log file.');
    }
  }
});

app.listen(PORT, () => {
  console.log('Server Listening on PORT:', PORT);
});

module.exports = app;

