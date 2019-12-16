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

  describe("Sub-route: POST /invitations/:code", () => {
    // No preconfigured match to work with (only random)
    // it("Should return 200", done => {
    //   chai
    //     .request(server)
    //     .post('/matches/invitations/'+existingCode)
    //     .set("Authorization", "Bearer " + token)
    //     .end((err, res) => {
    //       expect(err).to.not.exist;
    //       expect(res.status).to.be.eql(200);
    //       expect(res.type).to.be.eql("application/json");
    //       done();
    //     });
    // });
    it("With wrong code: should return 400", done => {
      chai
        .request(server)
        .post('/matches/invitations/'+0)
        .set("Authorization", "Bearer " + token)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(400);
          done();
        });
    });
  });

  describe("Sub-route: DELETE /invitations/:code", () => {
    // No preconfigured match to work with (only random)
    // it("Should return 200", done => {
    //   chai
    //     .request(server)
    //     .delete('/matches/invitations/'+existingCode)
    //     .set("Authorization", "Bearer " + token)
    //     .end((err, res) => {
    //       expect(err).to.not.exist;
    //       expect(res.status).to.be.eql(200);
    //       expect(res.type).to.be.eql("application/json");
    //       done();
    //     });
    // });
    it("With wrong code: should return 400", done => {
      chai
        .request(server)
        .delete('/matches/invitations/'+0)
        .set("Authorization", "Bearer " + token)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(400);
          done();
        });
    });
  });

  describe("Sub-route: PUT /:matchId/state", () => {

  });

  describe("Sub-route: PUT /hideAndSeek/:code/hiderStatus", () => {
    // No preconfigured match to work with (only random)
    // it("Should return 200", done => {
    //   chai
    //     .request(server)
    //     .put('/matches/hideAndSeek/'+existingCode+'/hiderStatus')
    //     .set("Authorization", "Bearer " + token)
    //     .send({catched: true})
    //     .end((err, res) => {
    //       expect(err).to.not.exist;
    //       expect(res.status).to.be.eql(200);
    //       expect(res.type).to.be.eql("application/json");
    //       done();
    //     });
    // });
    // it("Not hide-and-seek match code: should return 400", done => {
    //   chai
    //     .request(server)
    //     .put('/matches/hideAndSeek/'+existingCode+'/hiderStatus')
    //     .set("Authorization", "Bearer " + token)
    //     .send({catched: true})
    //     .end((err, res) => {
    //       expect(err).to.not.exist;
    //       expect(res.status).to.be.eql(400);
    //       done();
    //     });
    // });
    it("Wrong code: should return 400", done => {
      chai
        .request(server)
        .put('/matches/hideAndSeek/0/hiderStatus')
        .set("Authorization", "Bearer " + token)
        .send({catched: true})
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(400);
          done();
        });
    });
  });

  describe("Sub-route: PUT /hideAndSeek/:code/hiderLocation", () => {
    // No preconfigured match to work with (only random)
    // it("Should return 200", done => {
    //   chai
    //     .request(server)
    //     .put('/matches/hideAndSeek/'+existingCode+'/hiderLocation')
    //     .set("Authorization", "Bearer " + token)
    //     .send({
    //       latitude:0,
    //       longitude:0,
    //       requestId:0,
    //     })
    //     .end((err, res) => {
    //       expect(err).to.not.exist;
    //       expect(res.status).to.be.eql(200);
    //       expect(res.type).to.be.eql("application/json");
    //       done();
    //     });
    // });
    // it("Not hide-and-seek match code: should return 400", done => {
    //   chai
    //     .request(server)
    //     .put('/matches/hideAndSeek/'+existingCode+'/hiderLocation')
    //     .set("Authorization", "Bearer " + token)
    //     .send({
    //       latitude:0,
    //       longitude:0,
    //       requestId:0,
    //     })
    //     .end((err, res) => {
    //       expect(err).to.not.exist;
    //       expect(res.status).to.be.eql(400);
    //       done();
    //     });
    // });
    it("Wrong code: should return 400", done => {
      chai
        .request(server)
        .put('/matches/hideAndSeek/0/hiderLocation')
        .set("Authorization", "Bearer " + token)
        .send({
          latitude:0,
          longitude:0,
          requestId:0,
        })
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(400);
          done();
        });
    });
  });
});