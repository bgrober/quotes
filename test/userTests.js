const { use, Should } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { deleteAll } = require('../db/users');

const should = Should();

use(chaiHttp);

//user tests
describe('/user', () => {
  //clear table before each test
  beforeEach(async (done) => { //Before each test we empty the database
    await deleteAll();
    done();
  });
  //Test user register
  describe('/POST user/register', () => {
      it('it should 400 for bad json', (done) => {
        chai.request(app)
          .post('/user/register')
          .send({})
          .end((err, res) => {
              res.should.have.status(400);
          });
        chai.request(app)
          .post('/user/register')
          .send({id: 'invalid', password: 'password', name: 'Raya'})
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.property('error');
            res.body.should.have.property('error').eql('Invalid Phone Number Entered');
          });
        chai.request(app)
          .post('/user/register')
          .send({id: '', password: 'password', name: 'Raya'})
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.property('error');
            res.body.should.have.property('error').eql('Bad param id');
          });
        chai.request(app)
          .post('/user/register')
          .send({id: '347-248-8831', password: 'password', name: ''})
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.property('error');
            res.body.should.have.property('error').eql('Bad param name');
          });
        chai.request(app)
          .post('/user/register')
          .send({id: '313-234-8831', password: '', name: 'Raya'})
          .end((err, res) => {
            console.log('returned in test', res.body);
            res.should.have.status(400);
            res.body.should.have.property('error');
            res.body.should.have.property('error').eql('Bad param password');
            done();
          });
      });
    // it('should return a token', () => {
      
    // }
  });
});
