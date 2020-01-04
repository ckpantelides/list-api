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

// Cinema search route

// fetch cinemas within 5 miles of lat & lon
app.get(
  "/cinemas",
  function(req, res, next) {
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
