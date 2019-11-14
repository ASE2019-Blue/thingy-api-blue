const expect = require('chai').expect;
const utilityService = require('../../app/services/utility-service');

describe('sleep()', function () {
    it('should sleep for a specific amount of time', async function () {
        let difference = 500;

        let timeBefore = Date.now();

        await utilityService.sleep(difference);

        let timeAfter = Date.now();

        let actualDifference = timeAfter - timeBefore;

        expect(actualDifference).to.be.at.least(difference);
    });
});