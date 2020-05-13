const request = require('request');
const fs = require('fs');
const parseLinkHeader = require('parse-link-header');

// express handles the different routes - cinema and film search
const express = require('express');
const app = express();

// each route is in a separate file
const filmtimes = require('./routes/filmtimes');
const cinemas = require('./routes/cinemas');
const cinemasearch = require('./routes/cinema-search');
const filmtimesapp = require('./routes/filmtimesapp');

const cors = require('cors');

const server = require('http').Server(app);

const port = process.env.PORT || 8000;
console.log(`Server running on port ${port}`);
server.listen(port);

// allows all CORs requests
app.use(cors());

// uses the routes declared above
app.use('/filmtimes', filmtimes);
app.use('/cinemas', cinemas);
app.use('/cinema-search', cinemasearch);
app.use('/filmtimesapp', filmtimesapp);
