const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const expect = require('chai').expect;

const app = require('../mock-server');
const server = app;

describe("Route: thingys/", () => {
  describe("Sub-route: GET /", () => {
    it("Should return list of thingys", done => {
      chai
        .request(server)
        .get('/thingys')
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
    it("With query only available: should return list of available thingys", done => {
      chai
        .request(server)
        .get('/thingys')
        .query({available: 1})
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
});