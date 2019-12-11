const chai = require("chai");
const should = chai.should();
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const expect = require('chai').expect;

const server = require('../mock-server');

describe("Route: games/", () => {
  describe("Sub-route: GET /", () => {
    it("Should return list of games", done => {
      chai
        .request(server)
        .get('/games')
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(200);
          expect(res.type).to.be.eql("application/json");
          expect(res.body).to.satisfy(function (val) {
            return  (Array.isArray(val));
          });
          done();
        });
    });
  });

  describe("Sub-route: GET /:gameKey/rating", () => {
    it("With correct gameKey: should return the rating of the game", done => {
      var gameKey = "hide-and-seek";
      chai
        .request(server)
        .get('/games/'+gameKey+'/rating')
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(200);
          expect(res.type).to.be.eql("application/json");
          expect(res.body).to.satisfy(function (num) {
            return  ((!isNaN(num)) || (num == null));
          });
          done();
        });
    });
    it("With wrong gameKey: should return 404, Game not found", done => {
      var gameKey = "BLOB";
      chai
        .request(server)
        .get('/games/'+gameKey+'/rating')
        .end((err, res) => {
          expect(res.status).to.be.eql(404);
          done();
        });
    });
  });
})