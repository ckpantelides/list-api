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
These routes receive the CinemaID from the from the frontend, sends the ID to TheList API, and filters out the returned events that don't include "film" in the description.

For the app, the results are filtered.  TheList doesn't return the film performances by day - instead it returns each film as a separate object with the week's performances of that particular film as a nested property of the film object. I therefore filter performances by date send back an array of films by date i.e. [0] contains today's films, [1] contains tomorrow's films.

### Cinema-search route
This route receives the search term from the frontend (it can be a placename or a post code) and send this to the google location API, which returns the longitude and latitude. These are then sent to TheList API, and the results are returned to the frontend.
