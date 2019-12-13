const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const expect = require('chai').expect;
const Game = require('../../app/models/game-model')

// const server = require('../mock-server');
const server = 'http://localhost:3000';

const userCredentials = {
  username: 'chai', 
  password: 'chai'
}

describe("Route: matches/", () => {
  var token;
  before(done => {
    chai
        .request(server)
        .post('/auth/token')
        .set('content-type', 'application/json')
        .send(userCredentials)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(200);
          expect(res.type).to.be.eql("application/json");
          token = res.body.token;
          done();
        });
  });
  describe("Sub-route: GET /", () => {
    it("Should return list of highscores", done => {
      chai
        .request(server)
        .get('/highscores')
        .set("Authorization", "Bearer " + token)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(200);
          expect(res.type).to.be.eql("application/json");
          expect(res.body).to.satisfy(function (val) {
            return  ((val[Game.TAP_GAME] != null)
              && (typeof val[Game.TAP_GAME] !== 'undefined')
              && (val[Game.HIDE_AND_SEEK] != null)
              && (typeof val[Game.HIDE_AND_SEEK] !== 'undefined'));
          });
          done();
        });
    });
  });
});