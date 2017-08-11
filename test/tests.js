//Require the dev-dependencies
const { use, Should } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

const should = Should();

use(chaiHttp);
//Our parent block
describe('/', () => {
    beforeEach((done) => { //Before each test we empty the database
      done();         
    });     
/*
  * Test the /GET route
  */
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
});
