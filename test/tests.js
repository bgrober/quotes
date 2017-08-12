const { use, Should } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

const should = Should();

use(chaiHttp);

//base tests
describe('base tests', () => {
  beforeEach((done) => { //Before each test we empty the database
    done();         
  });     

  // Test the server is up
  describe('/GET index', () => {
    it('it should check the app is up', (done) => {
      chai.request(app)
        .get('/')
        .end((err, res) => {
            res.should.have.status(200);
          done();
        });
    });
  });

  // Test that an invalid route 404s
  describe('/GET bad routes', () => {
    it('it should check the app is up', (done) => {
      chai.request(app)
        .get('/thisisafakeroute')
        .end((err, res) => {
            res.should.have.status(404);
          done();
        });
    });
  });

});
