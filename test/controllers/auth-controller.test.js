const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const { describe } = mocha;
const { it } = mocha;
const { expect } = chai;

const server = 'http://localhost:3000';

const userCredentials = {
    username: 'chai',
    password: 'chai',
};

const userCredentialsWU = {
    username: 'chai1',
    password: 'chai',
};

const userCredentialsWP = {
    username: 'chai',
    password: 'chai1',
};

// describe("Route: sign-up", () => {
//     it("Should create a user", done => {
//         chai
//             .request(server)
//             .post('/sign-up')
//             .set('content-type', 'application/json')
//             .send(userCredentials)
//             .end((err, res) => {
//                 expect(err).to.not.exist;
//                 expect(res.status).to.be.eql(200);
//                 expect(res.type).to.be.eql("application/json");
//                 token = res.body.token;
//                 done();
//             });
//     });
// });

describe('Route: auth/', () => {
    describe('Sub-route: POST /token', () => {
        it('Should return a token', (done) => {
            chai
                .request(server)
                .post('/auth/token')
                .set('content-type', 'application/json')
                .send(userCredentials)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    expect(res.status).to.be.eql(200);
                    expect(res.type).to.be.eql('application/json');
                    expect(res.body).to.satisfy((val) => (val.token != null) && (typeof val.token !== 'undefined'));
                    done();
                });
        });
        it('Wrong username: should return 400', (done) => {
            chai
                .request(server)
                .post('/auth/token')
                .set('content-type', 'application/json')
                .send(userCredentialsWU)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    expect(res.status).to.be.eql(400);
                    done();
                });
        });
        it('Wrong password: should return 400', (done) => {
            chai
                .request(server)
                .post('/auth/token')
                .set('content-type', 'application/json')
                .send(userCredentialsWP)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    expect(res.status).to.be.eql(400);
                    done();
                });
        });
    });
});
