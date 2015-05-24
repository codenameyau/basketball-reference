# basketball-reference

Web scraper for basketball-reference.com. This scraper was built to provide a
free alternative for collecting NBA data. Building a web scraper with
node+cheerio is painful. But boy is it fast as fuck--not to mention asynchronous.

### Installation
```
npm install basketball-reference --save
```

### Quickstart
```javascript
var scraper = require('basketball-reference');

scraper.getLeagueStandings(2013, function(data) {
  console.log(data);
});
```
