const { use, Should, expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { createQuote, findSaidBy, deleteAllQuotes }  = require('../db/quotes');
const { deleteAllUsers } = require('../db/users');

const should = Should();

use(chaiHttp);

//quote tests
describe('/quote', () => {
  before(async () => {
    await deleteAllQuotes();
    await deleteAllUsers();
    const quoteData = {
      text: 'Ghost, to me',
      said: { name: 'Bastard', phone: '234-134-2434' },
      heard: [
        { name: 'Eddard Stark', phone: '234-104-2434' },
        { name: 'Rob Stark', phone: '234-124-2434' },
        { name: 'Sansa Stark', phone: '234-144-2434' },
        { name: 'Arya Stark', phone: '234-154-2434' },
        { name: 'Bran Stark', phone: '234-164-2434' },
        { name: 'Rickon Stark', phone: '234-174-2434' }
      ],
    };
    [...Array(10).keys()].forEach( async (i) => {
      // Set an old timestamp
      let obj = Object.assign({ts: (Date.now() - (10000 * i))}, quoteData);
      const result = await createQuote(obj);
    });
  });

  describe('/POST /quote', () => {
    it('it should 400 for bad json', (done) => {
      chai.request(app)
        .post('/quote')
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done()
        });
    });

    it('should return 200 when quote creation worked', async () => {

      // Create a user that can post a quote
      const res = chai.request(app)
        .post('/user/register')
        .send({ id: '234-114-2434', password: 'Stoneheart', name: 'Catelyn Stark' })
      await res;
      const userRes = res.res;
      token = userRes.body.token
      userRes.statusCode.should.eql(200);
      token.should.be.a('string');


      //quote Data for the post
      const quoteData = {
        token,
        text: 'Winter is coming',
        said: { name: 'Eddard Stark', phone: '234-104-2434' },
        heard: [
          { name: 'Rob Stark', phone: '234-124-2434' },
          { name: 'Bastard', phone: '234-134-2434' },
          { name: 'Sansa Stark', phone: '234-144-2434' },
          { name: 'Arya Stark', phone: '234-154-2434' },
          { name: 'Bran Stark', phone: '234-164-2434' },
          { name: 'Rickon Stark', phone: '234-174-2434' }
        ],
        ts: Date.now() 
      };

      const qRes = chai.request(app)
        .post('/quote')
        .send(quoteData)
      await qRes;
      const quoteRes = qRes.res;
      quoteRes.statusCode.should.eql(200);
    });
  });

  describe('/GET /said', () => {
    it('should find all that were said', async () => {
      const res = chai.request(app)
        .post('/user/register')
        .send({ id: '234-134-2434', password: 'Ghost', name: 'Jon Snow' })
      await res;
      const userRes = res.res;
      token = userRes.body.token
      userRes.statusCode.should.eql(200);
      token.should.be.a('string');

      const qRes = chai.request(app)
        .get(`/quote/said?token=${token}&limit=3`)
        .send()
      await qRes;
      const quoteRes = qRes.res;

      quoteRes.statusCode.should.eql(200);
      quoteRes.body.should.have.property('quotes');
      quoteRes.body.quotes.should.have.lengthOf(3);
      quoteRes.body.should.have.property('scrollId');
      const scrollId = quoteRes.body.scrollId;

      // Paging
      const qRes1 = chai.request(app)
        .get(`/quote/said?token=${token}&limit=3&scrollId=${scrollId}`)
        .send()
      await qRes1;
      const quoteRes1 = qRes1.res;

      quoteRes1.statusCode.should.eql(200);
      quoteRes1.body.should.have.property('quotes');
      quoteRes1.body.quotes.should.have.lengthOf(3);
      quoteRes1.body.should.have.property('scrollId');

      // Check that elements are not the same
      quoteRes1.body.quotes.forEach((elem, i) => {
        elem.ts.should.not.eql(quoteRes.body.quotes[i].ts);
      });
    });
  });

  describe('/GET /heard', () => {
    it('should find all that were heard', async () => {
      const res = chai.request(app)
        .post('/user/register')
        .send({ id: '234-104-2434', password: 'Ice', name: 'Eddard Stark' })
      await res;
      const userRes = res.res;
      token = userRes.body.token
      userRes.statusCode.should.eql(200);
      token.should.be.a('string');

      const qRes = chai.request(app)
        .get(`/quote/heard?token=${token}&limit=3`)
        .send()
      await qRes;
      const quoteRes = qRes.res;

      quoteRes.statusCode.should.eql(200);
      quoteRes.body.should.have.property('quotes');
      quoteRes.body.quotes.should.have.lengthOf(3);
      quoteRes.body.should.have.property('scrollId');
      const scrollId = quoteRes.body.scrollId;

      // Paging
      const qRes1 = chai.request(app)
        .get(`/quote/heard?token=${token}&limit=3&scrollId=${scrollId}`)
        .send()
      await qRes1;
      const quoteRes1 = qRes1.res;

      quoteRes1.statusCode.should.eql(200);
      quoteRes1.body.should.have.property('quotes');
      quoteRes1.body.quotes.should.have.lengthOf(3);
      quoteRes1.body.should.have.property('scrollId');

      // Check that elements are not the same
      quoteRes1.body.quotes.forEach((elem, i) => {
        elem.ts.should.not.eql(quoteRes.body.quotes[i].ts);
      });
    });
  });

  describe('/GET /all', () => {
    it('should find all that were heard or said', async () => {
      const res = chai.request(app)
        .post('/user/login')
        .send({ id: '234-104-2434', password: 'Ice' })
      await res;
      const userRes = res.res;
      token = userRes.body.token
      userRes.statusCode.should.eql(200);
      token.should.be.a('string');

      const qRes = chai.request(app)
        .get(`/quote/all?token=${token}&limit=3`)
        .send()
      await qRes;
      const quoteRes = qRes.res;

      quoteRes.statusCode.should.eql(200);
      quoteRes.body.should.have.property('quotes');
      quoteRes.body.quotes.should.have.lengthOf(3);
      quoteRes.body.should.have.property('scrollId');
      quoteRes.body.quotes[0].text.should.eql('Winter is coming');
      const scrollId = quoteRes.body.scrollId;

      // Paging
      const qRes1 = chai.request(app)
        .get(`/quote/all?token=${token}&limit=3&scrollId=${scrollId}`)
        .send()
      await qRes1;
      const quoteRes1 = qRes1.res;

      quoteRes1.statusCode.should.eql(200);
      quoteRes1.body.should.have.property('quotes');
      quoteRes1.body.quotes.should.have.lengthOf(3);
      quoteRes1.body.should.have.property('scrollId');

      // Check that elements are not the same
      quoteRes1.body.quotes.forEach((elem, i) => {
        elem.ts.should.not.eql(quoteRes.body.quotes[i].ts);
      });
    });
  });

  describe('/GET /search', () => {
    it('should find all that were heard or said where text is similar', async () => {
      const res = chai.request(app)
        .post('/user/login')
        .send({ id: '234-104-2434', password: 'Ice' })
      await res;
      const userRes = res.res;
      token = userRes.body.token
      userRes.statusCode.should.eql(200);
      token.should.be.a('string');

      const qRes = chai.request(app)
        .get(`/quote/search?token=${token}&text=winter&limit=3`)
        .send()
      await qRes;
      const quoteRes = qRes.res;

      quoteRes.statusCode.should.eql(200);
      quoteRes.body.should.have.property('quotes');
      quoteRes.body.quotes.should.have.lengthOf(1);
      quoteRes.body.quotes[0].text.should.eql('Winter is coming');

      // Paging
      const qRes1 = chai.request(app)
        .get(`/quote/search?token=${token}&limit=3&text=ghost`)
        .send()
      await qRes1;
      const quoteRes1 = qRes1.res;

      quoteRes1.statusCode.should.eql(200);
      quoteRes1.body.should.have.property('quotes');
      quoteRes1.body.quotes.should.have.lengthOf(3);
      quoteRes1.body.should.have.property('scrollId');
    });
  });
});
