const express = require('express');
const { PORT } = require('./config');
const fs = require('fs');
const readline = require('readline');

const app = express();
app.use(express.json());

app.listen(PORT, () => {
  console.log('Server Listening on PORT:', PORT);
});

app.get('/listLogs/:filename', (request, response) => {
  const n = parseInt(request.query.n);
  const filename = request.params.filename;
  const filter = request.query.filter || '';

  if (isNaN(n) || n <= 0) {
    response.status(400).send("Invalid or missing 'n' parameter.");
    return;
  }

  if (!filename) {
    response.status(400).send("Invalid or missing 'filename' parameter.");
    return;
  }

  const filePath = `/var/log/${filename}.log`;

  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const filteredLines = [];
  rl.on('line', (line) => {
    if (line.includes(filter)) {
      filteredLines.push(line);
    }
  });

  rl.on('close', () => {
    const lastNLines = filteredLines.slice(-n).join('\n');
    response.send(lastNLines);
  });
});

