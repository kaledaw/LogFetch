/*
This version of the solution reads the file from the bottom and read in chunks. It would help for extremely large files but 
I think it is an overkill for a log file. I included it here anyway.
*/

const express = require('express');
const { PORT } = require('./config');
const fs = require('fs');
const app = express();

function readLinesFromEndOfFile(filePath, n, filter) {
  const buffer = Buffer.alloc(1024); // Read in chunks
  const lines = [];
  const fd = fs.openSync(filePath, 'r');
  let bytesRead;
  let position = fs.statSync(filePath).size;
  let matchingLines = 0;

  while (matchingLines < n && position > 0) {
    const bytesToRead = Math.min(position, buffer.length);
    position -= bytesToRead;

    bytesRead = fs.readSync(fd, buffer, 0, bytesToRead, position);
    const chunk = buffer.toString('utf8', 0, bytesRead);
    const reversedChunk = chunk.split('\n').reverse();

    for (const line of reversedChunk) {
      if (line.includes(filter)) {
        lines.unshift(line);
        matchingLines++;

        if (matchingLines >= n) {
          break;
        }
      }
    }
  }

  fs.closeSync(fd);
  return lines.join('\n');
}


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

app.get('/listLogs/:filename', validateParameters, (request, response) => {
  const { n, filename, filter } = request.logParams;
  const filePath = `/var/log/${filename}.log`;

  if (!fs.existsSync(filePath)) {
    return response.status(404).send('Log file not found.');
  }

  // Use the function to read the last N lines
  const lastNLines = readLinesFromEndOfFile(filePath, n, filter);

  // Send the last N lines as the response
  response.send(lastNLines);
});

app.listen(PORT, () => {
  console.log('Server Listening on PORT:', PORT);
});

module.exports = app;

