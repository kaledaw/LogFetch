const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const app = require(path.join(__dirname, '..', 'app'));

chai.use(chaiHttp);
const expect = chai.expect;

describe('GET /listLogs/:filename', () => {
  before(() => {
    // Any setup code you need to run before tests
  });

  it('should return the last N lines of the log file', (done) => {
    chai
      .request(app)
      .get('/listLogs/system?n=10')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.be.a('string');
        done();
      });
  });

  it('should handle missing or invalid parameters', (done) => {
    chai
      .request(app)
      .get('/listLogs/system') // Missing 'n' parameter
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.text).to.equal("Invalid or missing 'n' parameter.");
        done();
      });
  });

  it('should handle requests with an invalid filename', (done) => {
    chai
      .request(app)
      .get('/listLogs/InvalidFileName?n=10')
      .end((err, res) => {
        expect(res).to.have.status(404); // Or another appropriate status code
//        expect(res.text).to.equal('Log file not found.');
        done();
      });
  });

  it('should handle requests with a missing "n" parameter', (done) => {
    chai
      .request(app)
      .get('/listLogs/system') // Missing 'n' parameter
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.text).to.equal('Invalid or missing \'n\' parameter.'); // Use single quotes here
        done();
      });
  });

  it('should handle a request with a large "n" value', (done) => {
    chai
      .request(app)
      .get('/listLogs/install?n=8000') // Use a large number
      .end((err, res) => {
        expect(res).to.have.status(200);
        const numberOfLines = (res.text.match(/\n/g) || []).length + 1; // Count the number of lines
        expect(numberOfLines).to.equal(8000); // Assert that the number of lines matches the expected value.
        done();
      });
  });
});

