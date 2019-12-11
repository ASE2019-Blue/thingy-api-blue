const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const expect = require('chai').expect;

const app = require('../mock-server');
const server = app;

describe("Route: users/", () => {
  describe("Sub-route: GET /", () => {
    it("Should return list of users", done => {
      chai
        .request(server)
        .get('/users')
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

  describe("Sub-route: GET /:username", () => {
    it("Should return one user", done => {
      chai
        .request(server)
        .get('/users/chai')
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(200);
          expect(res.type).to.be.eql("application/json");
          done();
        });
    });
    it("Wrong username: should return 404", done => {
      chai
        .request(server)
        .get('/users/chai1')
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(404);
          done();
        });
    });
  });

  describe("Sub-route: GET /:username/highscores", () => {
    it("Should return map of results", done => {
      chai
        .request(server)
        .get('/users/chai/highscores')
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(200);
          expect(res.type).to.be.eql("application/json");
          expect(res.body).to.satisfy(function (val) {
            return  ((val['tap-game'] != null)
              && (typeof val['tap-game'] !== 'undefined')
              && (val['hide-and-seek'] != null)
              && (typeof val['hide-and-seek'] !== 'undefined'));
          });
          done();
        });
    });
    it("Wrong username: should return 404", done => {
      chai
        .request(server)
        .get('/users/chai1/highscores')
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(404);
          done();
        });
    });
  });
});