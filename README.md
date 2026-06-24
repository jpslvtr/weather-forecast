# Weather Forecast Web App

A simple web application that displays the current conditions and a 12-hour forecast for a city name or zip code.

## Description

This web app provides weather information using:
- HTML/CSS/JavaScript frontend
- Bootstrap for styling
- The [Open-Meteo](https://open-meteo.com/) API (free, no API key required)

## Features

- Search by city name or zip code
- Current conditions plus a 12-hour forecast
- Sunrise and sunset times
- Clean, responsive interface

## Structure

- `index.html` - Main HTML page
- `css/style.css` - Custom styling
- `js/weatherapi.js` - Open-Meteo geocoding and forecast requests
- `js/weatherdom.js` - DOM rendering
- `bootstrap/` - Bootstrap files

## Dependencies

- Bootstrap
- jQuery
- Google Fonts (Open Sans)
- W3.CSS

No API key or build step is needed. Open the page (or serve the folder with any static web server) and search for a location.
