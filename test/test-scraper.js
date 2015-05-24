'use strict';

/***************************************************************
* Dependencies
***************************************************************/
var scraper = require('../src/scraper');
var assert = require('chai').assert;


/***************************************************************
* Test Suite
***************************************************************/
describe('scraper', function() {
  this.timeout(5000);

  describe('.getLeagueStandings()', function() {
    it('should correct parse the scraped data', function(done) {
      scraper.getLeagueStandings(2014, function(data) {
        var totalTeams = 30;
        assert.strictEqual(data.year, 2014);
        assert.lengthOf(data.standings, totalTeams);
        done();
      });
    });
  });

});
