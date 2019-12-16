const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const { describe } = mocha;
const { it } = mocha;
const { before } = mocha;
const { expect } = chai;

const server = 'http://localhost:3000';

const userCredentials = {
    username: 'chai',
    password: 'chai',
};

describe('Route: thingys/', () => {
    let token;
    let thingyId;
    before((done) => {
        chai
            .request(server)
            .post('/auth/token')
            .set('content-type', 'application/json')
            .send(userCredentials)
            .end((err, res) => {
                expect(err).to.not.exist;
                expect(res.status).to.be.eql(200);
                expect(res.type).to.be.eql('application/json');
                token = res.body.token;
                done();
            });
    });

    describe('Sub-route: GET /', () => {
        it('Should return list of thingys', (done) => {
            chai
                .request(server)
                .get('/thingys')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    expect(res.status).to.be.eql(200);
                    expect(res.type).to.be.eql('application/json');
                    expect(res.body).to.satisfy((val) => (Array.isArray(val)));
                    thingyId = res.body[0]._id;
                    done();
                });
        });
        it('With query only available: should return list of available thingys', (done) => {
            chai
                .request(server)
                .get('/thingys')
                .set('Authorization', `Bearer ${token}`)
                .query({ available: 1 })
                .end((err, res) => {
                    expect(err).to.not.exist;
                    expect(res.status).to.be.eql(200);
                    expect(res.type).to.be.eql('application/json');
                    expect(res.body).to.satisfy((val) => (Array.isArray(val)));
                    done();
                });
        });
    });

    describe('Sub-route: POST /:thingyId/lock', () => {
    // Only works when thingy is unlocked
        it('Should return 200', (done) => {
            chai
                .request(server)
                .post(`/thingys/${thingyId}/lock`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    expect(res.status).to.be.eql(200);
                    done();
                });
        });
        it('Lock same thingy a second time: should return 400', (done) => {
            chai
                .request(server)
                .post(`/thingys/${thingyId}/lock`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    expect(res.status).to.be.eql(400);
                    done();
                });
        });
        it('Wrong thingyId: should return 400', (done) => {
            chai
                .request(server)
                .post('/thingys/000000000000000000000000/lock')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    expect(res.status).to.be.eql(400);
                    done();
                });
        });
    });

    describe('Sub-route: DELETE /:thingyId/lock', () => {
    // Only works when thingy is unlocked
        it('Should return 200', (done) => {
            chai
                .request(server)
                .delete(`/thingys/${thingyId}/lock`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    expect(res.status).to.be.eql(200);
                    done();
                });
        });
        it('Lock same thingy a second time: should return 400', (done) => {
            chai
                .request(server)
                .delete(`/thingys/${thingyId}/lock`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    expect(res.status).to.be.eql(400);
                    done();
                });
        });
        it('Wrong thingyId: should return 400', (done) => {
            chai
                .request(server)
                .delete('/thingys/000000000000000000000000/lock')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    expect(res.status).to.be.eql(400);
                    done();
                });
        });
    });
});
