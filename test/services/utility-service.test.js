const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const utilityService = require('../../app/services/utility-service');

chai.use(chaiHttp);

const { describe } = mocha;
const { it } = mocha;
const { expect } = chai;

describe('sleep()', () => {
    it('should sleep for a specific amount of time', async () => {
        const difference = 500;

        const timeBefore = Date.now();

        await utilityService.sleep(difference);

        const timeAfter = Date.now();

        const actualDifference = timeAfter - timeBefore;

        expect(actualDifference).to.be.at.least(difference);
    });
});
