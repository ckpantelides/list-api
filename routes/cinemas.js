// /cinemas route - get cinemas by longitude and latitude
const express = require('express');
const router = express.Router();
const request = require('request');

router.get(
  '/',
  function (req, res, next) {
    let cinemas = [];
    let lat = req.query.lat;
    let lon = req.query.lon;
    // let startUrl = 'https://api.list.co.uk/v1/places?near=51.6016,-0.1934/5';
    let startUrl = `https://api.list.co.uk/v1/places?near=${lat},${lon}/5`;
    let apiKey = process.env.thelistAPI;

    let getCinemas = function (url) {
      let opts = {
        url: url,
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
        next();
      });
    };
    getCinemas(startUrl);
  },
  function (req, res) {
    res.send(req.app.locals.cinemas);
  }
);

module.exports = router;
