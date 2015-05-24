/*!
 * basketball-reference
 * MIT License (c) 2015
 * https://github.com/codenameyau/basketball-reference
 *
 * Description:
 * Scraper for basketball-reference.com that outputs JSON.
 */
'use strict';


/***************************************************************
* Dependencies
***************************************************************/
var request = require('request');
var cheerio = require('cheerio');
var util = require('util');


/***************************************************************
* Globals
***************************************************************/
var BASE_URL = 'http://www.basketball-reference.com/';


/***************************************************************
* Internal Functions
***************************************************************/
var getURL = function(menu, resource) {
  return util.format('%s/%s/%s.html',
    BASE_URL, menu, resource);
};

var convertToNumber = function(value) {
  if (isNaN(value)) {
    return 0;
  } else {
    return parseFloat(value);
  }
};

var parseConferenceName = function($conference) {
  return $conference.find('.sort_default_asc').html();
};

var parseDivisionName = function($row) {
  return $row.find('.black_text')[0].children[0].data;
};

var parseSeed = function(text) {
  return parseInt(
    text.match(/\(\d+\)/gm)[0]
        .match(/\d+/gm)[0], 10);
};

var parseStanding = function($row) {
  // Preview of JSON.
  var standing = {};

  // Get team id and name from url.
  var teamURL = $row.find('a');
  standing.id = teamURL.attr().href.match(/[A-Z]+/g)[0];
  standing.team = teamURL.text();

  // Get team standings from raw data.
  var rawData = $row.text().trim()
                .replace(/\n\s+/gm, ',')
                .split(',');

  // Keys for JSON standing.
  var keys = [
    'seed',
    'wins',
    'loses',
    'win_percentage',
    'games_behind',
    'points_per_game',
    'points_allowed',
    'simple_rating_system',
  ];

  // Seed requires its own parser.
  standing.seed = parseSeed(rawData[0]);
  for (var i=1, len=rawData.length; i<len; i++) {
    standing[keys[i]] = convertToNumber(rawData[i]);
  }
  return standing;
};

var addConferenceStandings = function(standings, $, conference) {
  var $conference = $(conference);
  var conferenceName = parseConferenceName($conference);
  var divisionName;

  // Parse table information.
  $conference.find('tbody tr').each(function(i, row) {
    var $row = $(row);

    // Table header for Division.
    if ($row.hasClass('partial_table')) {
      divisionName = parseDivisionName($row);
    }

    // Table row for team standings.
    else if ($row.hasClass('full_table')) {
      var team = parseStanding($row);
      team.conference = conferenceName;
      team.division = divisionName;
      standings.push(team);
    }
  });
};

var parseLeagueStandings = function(body) {
  var standings = [];
  var $ = cheerio.load(body);
  addConferenceStandings(standings, $, '#E_standings');
  addConferenceStandings(standings, $, '#W_standings');
  return standings;
};


/***************************************************************
* Module Exports
***************************************************************/
exports.getLeagueStandings = function(year, cb) {
  var url = getURL('leagues', 'NBA_' + year + '_standings');
  request.get(url, function(error, res, body) {
    if (!error && res.statusCode === 200) {
      cb({
          year: year,
          standings: parseLeagueStandings(body),
        });
    }
  });
};
