// fetch film times for a chosen cinema - requests via app only
const express = require('express');
const router = express.Router();
const request = require('request');

router.get('/', function (req, res, next) {
  let filmTimes = [];

  // Test cinema - Prince Charles Leicester Sq:
  // let cinemaID = '00103822-025d-343d-4919-21050000b36b';
  let cinemaID = req.query.cinemaID;
  let startUrl = `https://api.list.co.uk/v1/events?place_id=${cinemaID}`;
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
    if (body.length > 0) {
      body = body.filter((e) => {
        return e.tags.includes('film');
      });
    }
    filmTimes = filmTimes.concat(body);

    // this function returns the films by day of the week. In the original data,
    // each film is an object, and all of the week's perfomances of that film are stored in
    // an array of objects
    function trimByDay(allFilmTimes, screeningDay) {
      // I've cloned the film data to avoid mutating the original. The spread operator
      // can't be used as a deep copy is needed
      let clonedData = [];
      for (let i = 0; i < allFilmTimes.length; i++) {
        clonedData[i] = {
          name: allFilmTimes[i].name,
          times: allFilmTimes[i].schedules[0].performances,
          description: allFilmTimes[i].descriptions[0].description,
        };
      }
      // Returns the date in YYYY-MM-DD format
      let formattedDate = screeningDay.toISOString().slice(0, 10);

      // only include performances that match the relevant date (above)
      let filteredPerformances = clonedData.map((film) => {
        film.times = film.times.filter(
          (x) => x.ts.slice(0, 10) == formattedDate
        );
        return film;
      });

      // filters out films without any performances on the relevant date
      let filmsByDay = filteredPerformances.filter(
        (obj) => obj.times.length > 0
      );

      return filmsByDay;
    }

    let longDate0 = new Date();
    let longDate1 = new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000);
    let longDate2 = new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000);
    let longDate3 = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);
    let longDate4 = new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000);
    let longDate5 = new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000);
    let longDate6 = new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000);

    if (filmTimes.length > 0 && filmTimes !== undefined) {
      let day0 = trimByDay(filmTimes, longDate0);
      let day1 = trimByDay(filmTimes, longDate1);
      let day2 = trimByDay(filmTimes, longDate2);
      let day3 = trimByDay(filmTimes, longDate3);
      let day4 = trimByDay(filmTimes, longDate4);
      let day5 = trimByDay(filmTimes, longDate5);
      let day6 = trimByDay(filmTimes, longDate6);

      // An array storing all of the film data to be sent to the front end
      let collatedFilmsByDay = [day0, day1, day2, day3, day4, day5, day6];
      return callback(collatedFilmsByDay);
    }
  });
  function callback(data) {
    res.send(data);
  }
});

module.exports = router;
