const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const expect = require('chai').expect;

// const server = require('../mock-server');
const server = 'http://localhost:3000';

const userCredentials = {
  username: 'chai', 
  password: 'chai'
}

describe("Route: matches/", () => {
  var existingId;
  var existingCode;
  var token;
  before(done => {
    chai
        .request(server)
        .post('/auth/token')
        .set("Authorization", "Bearer " + token)
        .set('content-type', 'application/json')
        .send(userCredentials)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(200);
          expect(res.type).to.be.eql("application/json");
          expect(res.body).to.satisfy(function (val) {
            token = res.body.token;
            return true;
          });
          done();
        });
  });

  describe("Sub-route: GET /", () => {
    it("Should return list of matches", done => {
      chai
        .request(server)
        .get('/matches')
        .set("Authorization", "Bearer " + token)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(200);
          expect(res.type).to.be.eql("application/json");
          expect(res.body).to.satisfy(function (val) {
            return  (Array.isArray(val));
          });
          existingId = res.body[0]._id;
          existingCode = res.body[0].code;
          done();
        });
    });
  });

  describe("Sub-route: GET /:matchId", () => {
    it("Should return one match", done => {
      chai
        .request(server)
        .get('/matches/'+existingId)
        .set("Authorization", "Bearer " + token)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(200);
          expect(res.type).to.be.eql("application/json");
          done();
        });
    });
    it("Wrong id: should return 404", done => {
      chai
        .request(server)
        .get('/matches/000000000000000000000000')
        .set("Authorization", "Bearer " + token)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(404);
          done();
        });
    });
  });

  describe("Sub-route: PUT /:matchId/players", () => {
    it("Should return 200", done => {
      chai
        .request(server)
        .put('/matches/'+existingId+"/players")
        .set("Authorization", "Bearer " + token)
        .set('content-type', 'application/json')
        .send({players: [{
          name: "name",
          user: "000000000000000000000000",
          color: "0,0,0",
          score: "0"
        }]})
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(200);
          expect(res.type).to.be.eql("application/json");
          done();
        });
    });
    it("Wrong id: should return 404", done => {
      chai
        .request(server)
        .put('/matches/000000000000000000000000/players')
        .set("Authorization", "Bearer " + token)
        .set('content-type', 'application/json')
        .send({players: [{
          name: "name",
          user: "000000000000000000000000",
          color: "0,0,0",
          score: "0"
        }]})
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(404);
          done();
        });
    });
  });
});