#### Installation

> npm install // install dependencies

> node start // run app

Movie Times backend
===================

This backend handles requests made by the Movie Times [app](https://github.com/ckpantelides/movietimes-native) and [website](https://github.com/ckpantelides/movietimes) for cinemas and film times.

It makes requests to [TheList API](https://api.list.co.uk/) and returns reformatted results to the frontend.

There are four routes - cinemas, filmtimes, filmtimesapp and cinema-search. All queries are made using Axios.

### Cinemas route
This route receives the users latitude and longitude from the frontend. It then sends this to TheList API, filters out the returned places that don't include "cinema" in their description, and sends back the first 10 results to the frontend.

### Filmtimes and filmtimesapp routes
These routes receive the CinemaID from the frontend, send the CinemaID to TheList API, and filter out the returned events that don't include "film" in the description.

For the "app" version, the results are filtered.  TheList API doesn't return the film performances by day - instead it returns each film as a separate object with the week's performances of that particular film as a nested property of the film object. The "app" route therefore filters and maps the films by date, sending back to the frontend an array of films by date i.e. [0] contains today's films, [1] contains tomorrow's films.

### Cinema-search route
This route receives the search term from the frontend (it can be a placename or a post code) and send this to the google location API, which returns the longitude and latitude. These are then sent to TheList API, and the results are returned to the frontend.
