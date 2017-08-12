const { use, Should, expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { getUser, deleteAll } = require('../db/users');

const should = Should();

use(chaiHttp);

//user tests
describe('/user', () => {
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
    it('should return a token', async () => {
      // Clear db
      await deleteAll();
      const id = '313-234-8831';
      const noUser = await getUser(id); 
      should.not.exist(noUser);

      const res = chai.request(app)
        .post('/user/register')
        .send({ id, password: 'password', name: 'Raya' })
      await res;
      const response = res.res;

      response.statusCode.should.eql(200);
      response.body.should.have.property('token');
      response.body.token.should.be.a('string');

      const user = await getUser(id); 
      const bool = user.id === id;
      expect(bool).to.be.true;
    });
    it('should be able to login', async () => {
      const id = '313-234-8831';
      const password = 'password';

      const res = chai.request(app)
        .post('/user/login')
        .send({ id, password })
      await res;
      const response = res.res;

      response.statusCode.should.eql(200);
      response.body.should.have.property('token');
      response.body.token.should.be.a('string');
    });
    it('bad password should 401 when logging in', (done) => {
      const id = '313-234-8831';
      const password = 'donthackme';

      const res = chai.request(app)
        .post('/user/login')
        .send({ id, password })
        .end((err, res) => {
          res.should.have.status(401);
          done()
        });
    });
    it('non existant user should 401', async () => {
      const id = '312-224-8231';
      const password = 'thisuserdontexist';
      const noUser = await getUser(id); 
      should.not.exist(noUser);

      try {
        await chai.request(app)
          .post('/user/login')
          .send({ id, password });
      } catch ({ response }) {
        response.should.have.status(401);
      }
    });
  });
});
