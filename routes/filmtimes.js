//  filmtimes route - fetch film times for a chosen cinema
const express = require('express');
const router = express.Router();
const request = require('request');

router.get(
  '/',
  function (req, res, next) {
    let filmTimes = [];
    // let cinemaID = '00001e51-c05d-343d-a500-65f40000a853';
    let cinemaID = req.query.cinemaID;
    let startUrl = `https://api.list.co.uk/v1/events?place_id=${cinemaID}`;
    let apiKey = process.env.thelistAPI;
    let getFilms = function (url) {
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
        if (body.length > 0) {
          body = body.filter((e) => {
            return e.tags.includes('film');
          });
        }
        filmTimes = filmTimes.concat(body);
        req.app.locals.data = JSON.stringify(filmTimes);
        next();
        // Testing - writing results to JSON:
        //  let data = JSON.stringify(filmTimes);
        //  fs.writeFileSync("film-times.json", data);
        //   console.log(JSON.stringify(filmTimes, null, "  "));
      });
    };
    getFilms(startUrl);
  },
  function (req, res) {
    res.send(req.app.locals.data);
  }
);

module.exports = router;
