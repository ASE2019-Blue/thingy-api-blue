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

describe("Route: games/", () => {
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

  after(() => {

  });

  describe("Sub-route: GET /", () => {
    it("Should return list of games", done => {
      chai
        .request(server)
        .get('/games')
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

  describe("Sub-route: GET /:gameKey/rating", () => {
    it("With correct gameKey: should return the rating of the game", done => {
      var gameKey = Game.HIDE_AND_SEEK;
      chai
        .request(server)
        .get('/games/'+gameKey+'/rating')
        .set("Authorization", "Bearer " + token)
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
        .set("Authorization", "Bearer " + token)
        .end((err, res) => {
          expect(res.status).to.be.eql(404);
          done();
        });
    });
  });

  describe("Sub-route: POST /:gameKey/rating", () => {
    it("With correct gameKey: should return the rating of the game", done => {
      var gameKey = Game.HIDE_AND_SEEK;
      let tmp = chai
        .request(server)
        .post('/games/'+gameKey+'/rating')
        .set("Authorization", "Bearer " + token)
        .set('content-type', 'application/json')
        .send({rating: 3});
        tmp.end((err, res) => {
          expect(res.status).to.be.eql(200);
          done();
        });
    });
    it("With wrong gameKey: should return 404, Game not found", done => {
      var gameKey = "BLOB";
      chai
        .request(server)
        .post('/games/'+gameKey+'/rating')
        .set("Authorization", "Bearer " + token)
        .set('content-type', 'application/json')
        .send({rating: 3})
        .end((err, res) => {
          expect(res.status).to.be.eql(404);
          done();
        });
    });
  });

  describe("Sub-route: GET /colors", () => {
    it("Should return list of games", done => {
      chai
        .request(server)
        .get('/games/colors')
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

  describe("Sub-route: POST /:gameKey/matches", () => {
    it("With correct Tap game configuration: should return match with code", done => {
      var gameKey = Game.TAP_GAME;
      var matchDto = {
        config: {
          players: [],
          numberOfRounds: 5,
        },
        thingys: [],
        colors: [],
      };
      let tmp = chai
        .request(server)
        .post('/games/'+gameKey+'/matches')
        .set("Authorization", "Bearer " + token)
        .set('content-type', 'application/json')
        .send(matchDto);
        tmp.end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(200);
          expect(res.type).to.be.eql("application/json");
          expect(res.body).to.satisfy(function (val) {
            return (val.code!=null)&&(typeof val.code !== 'undefined');
          });
          done();
        });
    });
    it("With correct Hide and Seek configuration: should return match with code", done => {
      var gameKey = Game.HIDE_AND_SEEK;
      var matchDto = {
        config: {
          players: [],
          gameTime: 5,
        },
        thingys: [],
      };
      let tmp = chai
        .request(server)
        .post('/games/'+gameKey+'/matches')
        .set("Authorization", "Bearer " + token)
        .set('content-type', 'application/json')
        .send(matchDto);
        tmp.end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(200);
          expect(res.type).to.be.eql("application/json");
          expect(res.body).to.satisfy(function (val) {
            return (val.code!=null)&&(typeof val.code !== 'undefined');
          });
          done();
        });
    });
    it("With wrong game key: should return 404", done => {
      var gameKey = "BLOB";
      let tmp = chai
        .request(server)
        .post('/games/'+gameKey+'/matches')
        .set("Authorization", "Bearer " + token)
        .set('content-type', 'application/json')
        tmp.end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(404);
          done();
        });
    });
    it("Without config: should return 400", done => {
      var gameKey = Game.HIDE_AND_SEEK;
      let tmp = chai
        .request(server)
        .post('/games/'+gameKey+'/matches')
        .set("Authorization", "Bearer " + token)
        .set('content-type', 'application/json')
        tmp.end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(400);
          done();
        });
    });
    it("Without thingys in config: should return 400", done => {
      var gameKey = Game.TAP_GAME;
      var matchDto = {
        config: {
          players: [],
          numberOfRounds: 5,
        },
        colors: [],
      };
      let tmp = chai
        .request(server)
        .post('/games/'+gameKey+'/matches')
        .set("Authorization", "Bearer " + token)
        .set('content-type', 'application/json')
        .send(matchDto);
        tmp.end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(400);
          done();
        });
    }); 
    it("Tap game without colors: should return 400", done => {
      var gameKey = Game.TAP_GAME;
      var matchDto = {
        config: {
          players: [],
          numberOfRounds: 5,
        },
        thingys: [],
      };
      let tmp = chai
        .request(server)
        .post('/games/'+gameKey+'/matches')
        .set("Authorization", "Bearer " + token)
        .set('content-type', 'application/json')
        .send(matchDto);
        tmp.end((err, res) => {
          expect(err).to.not.exist;
          expect(res.status).to.be.eql(400);
          done();
        });
    });
  });
});