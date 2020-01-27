const request = require("request");
const fs = require("fs");
const parseLinkHeader = require("parse-link-header");

// express handles the different routes - cinema and film search
const express = require("express");
const app = express();

const cors = require("cors");

// allows all CORs requests (for development)
app.use(cors());

const server = require("http").Server(app);

const port = process.env.PORT || 8000;
console.log(`Server running on port ${port}`);
server.listen(port);

// Mock data for testing
/*
const mockCinemaData = require("./cinemas.json");
const mockFilmData = require("./film-times.json");
let cinemas = mockCinemaData;
let filmTimes = mockFilmData;
*/

// Cinemas by latitude and longitude
// fetch cinemas within 5 miles of lat & lon
app.get(
  "/cinemas",
  function(req, res, next) {
    let cinemas = [];
    let lat = req.query.lat;
    let lon = req.query.lon;
    // let startUrl = "https://api.list.co.uk/v1/places?near=51.6016,-0.1934/5";
    let startUrl = `https://api.list.co.uk/v1/places?near=${lat},${lon}/5`;
    let apiKey = process.env.thelistAPI;
    let getCinemas = function(url) {
      let opts = {
        url: url,
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      };
      request(opts, function(err, res, body) {
        if (err) {
          console.log(err);
          process.exit();
        }
        body = JSON.parse(body);

        body = body.filter(e => {
          return e.tags.includes("cinemas");
        });
        cinemas = cinemas.concat(body).slice(0, 9);

        req.app.locals.cinemas = JSON.stringify(cinemas);
        next();
      });
    };
    getCinemas(startUrl);
  },
  function(req, res) {
    res.send(req.app.locals.cinemas);
  }
);

// fetch film times for chosen cinema
app.get(
  "/filmtimes",
  function(req, res, next) {
    let filmTimes = [];
    // let cinemaID = "00001e51-c05d-343d-a500-65f40000a853";
    let cinemaID = req.query.cinemaID;
    let startUrl = `https://api.list.co.uk/v1/events?place_id=${cinemaID}`;
    let apiKey = process.env.thelistAPI;
    let getFilms = function(url) {
      let opts = {
        url: url,
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      };
      request(opts, function(err, res, body) {
        if (err) {
          console.log(err);
          process.exit();
        }

        body = JSON.parse(body);
        if (body.length < 0) {
          body = body.filter(e => {
            return e.tags.includes("film");
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
  function(req, res) {
    res.send(req.app.locals.data);
  }
);

// find cinemas after placename search
app.get("/cinema-search", function(req, res, callback) {
  let cinemas = [];
  // takes search value and geocodes it using google API
  let newSearch = req.query.searchInput;
  let googleKey = process.env.googleAPI;

  let geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${newSearch}&key=${googleKey}`;

  request(geoUrl, function(err, response, body) {
    if (err) {
      console.log("Error with geo location search");
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
          Authorization: `Bearer ${apiKey}`
        }
      };
      request(opts, function(err, res, body) {
        if (err) {
          console.log(err);
          process.exit();
        }
        body = JSON.parse(body);

        body = body.filter(e => {
          return e.tags.includes("cinemas");
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

// fetch film times for chosen cinema - requests via app only
app.get("/filmtimesapp", function(req, res, next) {
  // console.log("Request received");
  let filmTimes = [];
  // let cinemaID = "00001e51-c05d-343d-a500-65f40000a853";
  let cinemaID = req.query.cinemaID;
  let startUrl = `https://api.list.co.uk/v1/events?place_id=${cinemaID}`;
  let apiKey = process.env.thelistAPI;

  let opts = {
    url: startUrl,
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  };
  request(opts, function(err, res, body) {
    if (err) {
      console.log(err);
      process.exit();
    }

    body = JSON.parse(body);
    if (body.length < 0) {
      body = body.filter(e => {
        return e.tags.includes("film");
      });
    }
    // filmTimes = filmTimes.concat(body);

    //  const mockFilmData = require("./film-times.json");
    const mockFilmData = filmTimes.concat(body);

    // The avoid the film data being mutated each time the performances are filter by date
    // I've created separate copies for each day of the week
    let trimmedMockData0 = [];
    let trimmedMockData1 = [];
    let trimmedMockData2 = [];
    let trimmedMockData3 = [];
    let trimmedMockData4 = [];
    let trimmedMockData5 = [];
    let trimmedMockData6 = [];

    // This creates an object trimming the unnecessary film data, leaving just the name
    // and the performances. I felt this was necessary as the original data array is complex and has
    // many nested properties
    if (mockFilmData.length > 0 && mockFilmData !== undefined) {
      for (let i = 0; i < mockFilmData.length; i++) {
        (trimmedMockData0[i] = {
          name: mockFilmData[i].name,
          times: mockFilmData[i].schedules[0].performances,
          description: mockFilmData[i].descriptions[0].description
        }),
          (trimmedMockData1[i] = {
            name: mockFilmData[i].name,
            times: mockFilmData[i].schedules[0].performances,
            description: mockFilmData[i].descriptions[0].description
          }),
          (trimmedMockData2[i] = {
            name: mockFilmData[i].name,
            times: mockFilmData[i].schedules[0].performances,
            description: mockFilmData[i].descriptions[0].description
          }),
          (trimmedMockData3[i] = {
            name: mockFilmData[i].name,
            times: mockFilmData[i].schedules[0].performances,
            description: mockFilmData[i].descriptions[0].description
          }),
          (trimmedMockData4[i] = {
            name: mockFilmData[i].name,
            times: mockFilmData[i].schedules[0].performances,
            description: mockFilmData[i].descriptions[0].description
          }),
          (trimmedMockData5[i] = {
            name: mockFilmData[i].name,
            times: mockFilmData[i].schedules[0].performances,
            description: mockFilmData[i].descriptions[0].description
          }),
          (trimmedMockData6[i] = {
            name: mockFilmData[i].name,
            times: mockFilmData[i].schedules[0].performances,
            description: mockFilmData[i].descriptions[0].description
          });
      }
    }

    // this function returns the films by day of the week. In the original data,
    // each film is an object, and all of the week's perfomances of that film are stored in
    // an array of objects
    function factoryTrim(filmTimes, screeningDay) {
      let formattedDate = screeningDay.toISOString().slice(0, 10);

      // only include performances that match the relevant date (above)
      let filteredPerformances = filmTimes.map(function(CompareWithDate) {
        CompareWithDate.times = CompareWithDate.times.filter(
          x => x.ts.slice(0, 10) == formattedDate
        );
        return CompareWithDate;
      });

      // filters out films without any performances on the relevant date
      let filmsByDay = filteredPerformances.filter(obj => obj.times.length > 0);

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

    if (mockFilmData.length > 0 && mockFilmData !== undefined) {
      let day0 = factoryTrim(trimmedMockData0, longDate0);
      let day1 = factoryTrim(trimmedMockData1, longDate1);
      let day2 = factoryTrim(trimmedMockData2, longDate2);
      let day3 = factoryTrim(trimmedMockData3, longDate3);
      let day4 = factoryTrim(trimmedMockData4, longDate4);
      let day5 = factoryTrim(trimmedMockData5, longDate5);
      let day6 = factoryTrim(trimmedMockData6, longDate6);

      // An array storing all of the film data to be sent to the front end
      let collatedFilmsByDay = [day0, day1, day2, day3, day4, day5, day6];
      return callback(collatedFilmsByDay);
    }
  });
  function callback(data) {
    res.send(data);
  }
});
