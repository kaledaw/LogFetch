const express = require('express');
const { PORT } = require('./config');
const fs = require('fs');
const readline = require('readline');

const app = express();
app.use(express.json());

app.listen(PORT, () => {
  console.log('Server Listening on PORT:', PORT);
});

app.get('/listLogs/:filename', async (request, response) => {
  const n = parseInt(request.query.n);
  const filename = request.params.filename;
  const filter = request.query.filter || '';

  if (isNaN(n) || n <= 0) {
    return response.status(400).send("Invalid or missing 'n' parameter.");
  }

  if (!filename) {
    return response.status(400).send("Invalid or missing 'filename' parameter.");
  }

  const filePath = `/var/log/${filename}.log`;

  try {
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const filteredLines = [];
    for await (const line of rl) {
      if (line.includes(filter)) {
        filteredLines.push(line);
      }
    }

    const lastNLines = filteredLines.slice(-n).join('\n');
    response.send(lastNLines);
  } catch (err) {
    console.error(err);
    response.status(500).send("Error reading the log file.");
  }
});

