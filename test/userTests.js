const { use, Should, expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { getUser, deleteAllUsers } = require('../db/users');
const { createQuote, findAll, deleteAllQuotes } = require('../db/quotes');

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
      await deleteAllUsers();
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

    it('non existant user should 404', async () => {
      const id = '312-224-8231';
      const password = 'thisuserdontexist';
      const noUser = await getUser(id); 
      should.not.exist(noUser);

      try {
        await chai.request(app)
          .post('/user/login')
          .send({ id, password });
      } catch ({ response }) {
        response.should.have.status(404);
      }
    });

    it('should be able to login and get profile', async () => {
      const id = '313-234-8831';
      const password = 'password';

      const res = chai.request(app)
        .post('/user/login')
        .send({ id, password })
      await res;
      const response = res.res;

      response.statusCode.should.eql(200);
      response.body.should.have.property('token');
      const token = response.body.token;
      console.log(token);

      token.should.be.a('string');

      let profileResponse = chai.request(app)
        .get(`/user/profile?token=${token}`)
        .send();

      await profileResponse;

      profileResponse = profileResponse.res;

      profileResponse.statusCode.should.eql(200);
      profileResponse.body.should.have.property('name');
      profileResponse.body.name.should.eql('Raya');
    });
  });

  describe('/POST user/register', () => {
    it('when a new user joins update there name if they have quotes already', async () => {
      await deleteAllQuotes();
      await deleteAllUsers();

      const date = Date.now();
      const id = '234-134-2434';
      // Create a quote the user said and heard
      const saidQuoteData = {
        text: 'Ghost, to me',
        said: { name: 'Bastard', phone: id },
        heard: [
          { name: 'Eddard Stark', phone: '234-104-2434' },
        ],
        ts: date - 10000 
      };
      await createQuote(saidQuoteData);

      const heardQuoteData = {
        text: 'Winter is coming',
        said: { name: 'Eddard Stark', phone: '234-104-2434' },
        heard: [
          { name: 'Bastard', phone: id },
        ],
        ts: date - 20000 
      };
      await createQuote(heardQuoteData);

      const allQuotes = await findAll({ id, limit: 2, scrollId: date });
      // We guarantee order via the ts so know that the said quote is first
      allQuotes[0].name.should.eql('Bastard'); 
      allQuotes[1].heard[0].should.eql('Bastard'); 

      const res = chai.request(app)
        .post('/user/register')
        .send({ id, password: 'Ghost', name: 'Jon Snow' })
      await res;
      const response = res.res;

      response.statusCode.should.eql(200);
      response.body.should.have.property('token');
      response.body.token.should.be.a('string');

      const updatedAllQuotes = await findAll({ id, limit: 2, scrollId: date });
      updatedAllQuotes[0].name.should.eql('Jon Snow'); 
      updatedAllQuotes[1].heard[0].should.eql('Jon Snow'); 
    });
  });
});
