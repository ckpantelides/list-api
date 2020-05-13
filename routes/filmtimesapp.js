// fetch film times for a chosen cinema - requests via app only
const express = require('express');
const router = express.Router();
const request = require('request');

router.get('/', function (req, res, next) {
  let filmTimes = [];
  // let cinemaID = '00001e51-c05d-343d-a500-65f40000a853';
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

    // This creates an array trimming the unnecessary film data, leaving just the name
    // performances and description. I felt this was necessary as the original data array is
    // complex and has many nested properties
    let trimmedData = [];

    if (filmTimes.length > 0 && filmTimes !== undefined) {
      for (let i = 0; i < filmTimes.length; i++) {
        trimmedData[i] = {
          name: filmTimes[i].name,
          times: filmTimes[i].schedules[0].performances,
          description: filmTimes[i].descriptions[0].description,
        };
      }
    }

    // this function returns the films by day of the week. In the original data,
    // each film is an object, and all of the week's perfomances of that film are stored in
    // an array of objects
    function trimByDay(allFilmTimes, screeningDay) {
      let formattedDate = screeningDay.toISOString().slice(0, 10);

      // only include performances that match the relevant date (above)
      let filteredPerformances = allFilmTimes.map(function (CompareWithDate) {
        CompareWithDate.times = CompareWithDate.times.filter(
          (x) => x.ts.slice(0, 10) == formattedDate
        );
        return CompareWithDate;
      });

      // filters out films without any performances on the relevant date
      let filmsByDay = filteredPerformances.filter(
        (obj) => obj.times.length > 0
      );

      return filmsByDay;
    }

    // This gives the seven days of the week, which the function above trims to YYYY-MM-DD
    // The function above uses these dates to filter out which film performances are needed
    let longDate0 = new Date(new Date().getTime());
    let longDate1 = new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000);
    let longDate2 = new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000);
    let longDate3 = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);
    let longDate4 = new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000);
    let longDate5 = new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000);
    let longDate6 = new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000);

    if (filmTimes.length > 0 && filmTimes !== undefined) {
      // The spread operator is used to clone the trimmedData, so it's not mutated by each function call
      let day0 = trimByDay(...trimmedData, longDate0);
      let day1 = trimByDay(...trimmedData, longDate1);
      let day2 = trimByDay(...trimmedData, longDate2);
      let day3 = trimByDay(...trimmedData, longDate3);
      let day4 = trimByDay(...trimmedData, longDate4);
      let day5 = trimByDay(...trimmedData, longDate5);
      let day6 = trimByDay(...trimmedData, longDate6);

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
