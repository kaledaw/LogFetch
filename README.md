# LogFetch

```markdown
# Log Fetch API

The Log Fetch API is a Node.js application that allows you to retrieve the last N lines of log files with optional filtering.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [Contributing](#contributing)

## Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/your-username/log-fetch-api.git
   cd log-fetch-api
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

## Usage

To run the Log Fetch API locally, follow these steps:

1. Start the server:

   ```bash
   npm start
   ```

   The server will start on port 3000 by default. You can configure the port in the `config.js` file.

2. Use a web browser or a tool like `curl` or `httpie` to interact with the API. Example usage:

   - Retrieve the last 50 lines of the `system` log:

     ```bash
     curl http://localhost:3000/listLogs/system?n=50
     ```

   - Add a filter to search for lines containing the word "error":

     ```bash
     curl http://localhost:3000/listLogs/system?n=50&filter=error
     ```

   Replace `system` with the desired log file name, `50` with the number of lines you want to retrieve, and `error` with your desired filter.


## Testing

The Log Fetch API includes unit tests to ensure its functionality. To run the tests, follow these steps:

1. Make sure the server is not running.

2. Run the tests using Mocha:

   ```bash
   npm test
   ```

   This will execute the test suite and display the results in your terminal.

## Contributing

Contributions to this project are welcome. To contribute, please follow these steps:

1. Fork the repository.

2. Create a new branch for your feature or fix:

   ```bash
   git checkout -b feature-name
   ```

3. Make your changes and commit them:

   ```bash
   git commit -m "Your commit message"
   ```

4. Push your changes to your fork:

   ```bash
   git push origin feature-name
   ```

5. Create a pull request on the main repository.

```

