const express = require('express');
const { PORT } = require('./config');
const fs = require('fs');
const readline = require('readline');

const app = express();
app.use(express.json());

function validateParameters(req, res, next) {
  const n = parseInt(req.query.n);
  const filename = req.params.filename;
  const filter = req.query.filter || '';

  if (isNaN(n) || n <= 0) {
    return res.status(400).send("Invalid or missing 'n' parameter.");
  }

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

    rl.on('line', (line) => {
      if (line.includes(filter)) {
        filteredLines.push(line);
        if (filteredLines.length > n) {
          filteredLines.shift(); // Remove the oldest line if more than N lines are found
        }
      }
    });

    rl.on('close', () => {
      const lastNLines = filteredLines.join('\n');
      console.log(`Number of lines returned: ${filteredLines.length}`);
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

