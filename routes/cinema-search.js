// cinema-search route - find cinemas after placename search
const express = require('express');
const router = express.Router();
const request = require('request');

router.get('/', function (req, res, callback) {
  let cinemas = [];
  // takes search value and geocodes it using google API
  let newSearch = req.query.searchInput;
  let googleKey = process.env.googleAPI;

  let geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${newSearch}&key=${googleKey}`;

  request(geoUrl, function (err, response, body) {
    if (err) {
      console.log('Error with geo location search');
    }
    // if geocode a success, search for cinemas
    else {
      let geodata = JSON.parse(body);
      let lat = geodata.results[0].geometry.location.lat;
      let lon = geodata.results[0].geometry.location.lng;

      // let startUrl = "https://api.list.co.uk/v1/places?near=51.6016,-0.1934/5";
      let startUrl = `https://api.list.co.uk/v1/places?near=${lat},${lon}/5`;
      let apiKey = process.env.thelistAPI;

      let opts = {
        url: startUrl,
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      };
      request(opts, function (err, res, body) {
        if (err) {
          console.log(err);
          process.exit();
        }
        body = JSON.parse(body);

        body = body.filter((e) => {
          return e.tags.includes('cinemas');
        });
        cinemas = cinemas.concat(body).slice(0, 9);
        req.app.locals.cinemas = JSON.stringify(cinemas);
        let searchResults = req.app.locals.cinemas;
        return callback(searchResults);
      });
    }
  });
  function callback(data) {
    res.send(data);
  }
});

module.exports = router;
