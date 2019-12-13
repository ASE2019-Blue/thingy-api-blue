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

describe("Route: users/", () => {
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
    it("Should return list of users", done => {
      chai
        .request(server)
        .get('/users')
        .set("Authorization", "Bearer " + token)
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
        .set("Authorization", "Bearer " + token)
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
        .set("Authorization", "Bearer " + token)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(404);
          done();
        });
    });
  });

  describe("Sub-route: PUT /:username", () => {
    it("Should return 200", done => {
      userDto = {
        firstName: 'Chai',
        lastName: 'Mocha'
      };
      chai
        .request(server)
        .put('/users/chai')
        .set("Authorization", "Bearer " + token)
        .send(userDto)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(200);
          done();
        });
    });
    it("Wrong username: should return 400", done => {
      userDto = {
        firstName: 'Chai',
        lastName: 'Mocha'
      };
      chai
        .request(server)
        .put('/users/chai1')
        .set("Authorization", "Bearer " + token)
        .send(userDto)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(400);
          done();
        });
    });
  });

  describe("Sub-route: GET /:username/highscores", () => {
    it("Should return map of results", done => {
      chai
        .request(server)
        .get('/users/chai/highscores')
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
    it("Wrong username: should return 404", done => {
      chai
        .request(server)
        .get('/users/chai1/highscores')
        .set("Authorization", "Bearer " + token)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(404);
          done();
        });
    });
  });

  describe("Sub-route: PUT /:username/password", () => {
    it("Should return 200", done => {
      passwordDto = {
        currentPassword: userCredentials.password,
        newPassword: userCredentials.password
      };
      chai
        .request(server)
        .put('/users/chai/password')
        .set("Authorization", "Bearer " + token)
        .send(passwordDto)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(200);
          done();
        });
    });
    it("Wrong username: should return 400", done => {
      passwordDto = {
        currentPassword: userCredentials.password,
        newPassword: userCredentials.password
      };
      chai
        .request(server)
        .put('/users/chai1/password')
        .set("Authorization", "Bearer " + token)
        .send(passwordDto)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(400);
          done();
        });
    });
    it("No passwords: should return 400", done => {
      chai
        .request(server)
        .put('/users/chai1/password')
        .set("Authorization", "Bearer " + token)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(400);
          done();
        });
    });
    it("Wrong password: should return 400", done => {
      passwordDto = {
        currentPassword: userCredentials.password+1,
        newPassword: userCredentials.password
      };
      chai
        .request(server)
        .put('/users/chai1/password')
        .set("Authorization", "Bearer " + token)
        .send(passwordDto)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(400);
          done();
        });
    });
  });
  
  //No access to thingyId
  // describe("Sub-route: PUT /:username/thingy", () => {
  //   it("Should return 200", done => {
  //     chai
  //       .request(server)
  //       .put('/users/chai/thingy')
  //       .set("Authorization", "Bearer " + token)
  //       .send({thingy: thingyId})
  //       .end((err, res) => {
  //         expect(err).to.not.exist;
  //         expect(res.status).to.be.eql(200);
  //         done();
  //       });
  //   });
  //   it("Wrong username: should return 400", done => {
  //     chai
  //       .request(server)
  //       .put('/users/chai1/password')
  //       .set("Authorization", "Bearer " + token)
  //       .send({thingy: thingyId})
  //       .end((err, res) => {
  //         expect(err).to.not.exist;
  //         expect(res.status).to.be.eql(400);
  //         done();
  //       });
  //   });
  //   it("Wrong thingyId: should return 404", done => {
  //     chai
  //       .request(server)
  //       .put('/users/chai1/password')
  //       .set("Authorization", "Bearer " + token)
  //       .send({thingy: "000000000000000000000000"})
  //       .end((err, res) => {
  //         expect(err).to.not.exist;
  //         expect(res.status).to.be.eql(404);
  //         done();
  //       });
  //   });
  // });
});