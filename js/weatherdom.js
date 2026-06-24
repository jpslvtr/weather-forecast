const input = document.querySelector('.input-location');
const updateDetails = document.querySelector('.updateDetails');
const forecast = new Forecast();

const updateUI = (data) => {
  const { location, weather } = data;
  const current = weather.current;
  const hourly = weather.hourly;
  const daily = weather.daily;

  const locationName = location.admin1
    ? `${location.name}, ${location.admin1}`
    : location.name;
  const currentDate = formatDate(current.time);
  const sunrise = formatTime(daily.sunrise[0]);
  const sunset = formatTime(daily.sunset[0]);

  let rows = `<tr>
      <td>${formatTime(current.time)}</td>
      <td>${formatTemp(current.temperature_2m)}</td>
      <td>${describeWeather(current.weather_code)}</td>
      <td>${degToCompass(current.wind_direction_10m)} ${formatWind(current.wind_speed_10m)}</td>
    </tr>`;

  for (let i = 0; i < hourly.time.length; i++) {
    const chance = hourly.precipitation_probability[i];
    const weatherText = chance > 0
      ? `${describeWeather(hourly.weather_code[i])}, ${chance}%`
      : describeWeather(hourly.weather_code[i]);
    rows += `<tr>
        <td>${formatHour(hourly.time[i])}</td>
        <td>${formatTemp(hourly.temperature_2m[i])}</td>
        <td>${weatherText}</td>
        <td>${degToCompass(hourly.wind_direction_10m[i])} ${formatWind(hourly.wind_speed_10m[i])}</td>
      </tr>`;
  }

  updateDetails.innerHTML = `<br>
    Location: ${locationName}<br>
    Date: ${currentDate}<br>
    Sunrise: ${sunrise}<br>
    Sunset: ${sunset}<br><br>
    <table class="table table-striped table-bordered table-condensed">
      <tr>
        <td>Time</td>
        <td>Temp</td>
        <td>Weather</td>
        <td>Wind</td>
      </tr>
      ${rows}
    </table>`;
};

function formatTemp(value) {
  return Math.round(value) + " &deg;F";
}

function formatWind(value) {
  return Math.round(value) + " mph";
}

// Open-Meteo returns location-local times as ISO strings without an offset
// (for example "2026-06-24T16:15"). Parse the parts directly so the browser's
// timezone never shifts the displayed value.
function parseLocal(isoStr) {
  const [datePart, timePart] = isoStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return { year, month, day, hour, minute };
}

function to12Hour(hour) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  let h = hour % 12;
  if (h === 0) h = 12;
  return { h, suffix };
}

function formatDate(isoStr) {
  const { year, month, day } = parseLocal(isoStr);
  return `${month}/${day}/${year}`;
}

function formatTime(isoStr) {
  const { hour, minute } = parseLocal(isoStr);
  const { h, suffix } = to12Hour(hour);
  const mm = ("0" + minute).slice(-2);
  return `${h}:${mm} ${suffix}`;
}

function formatHour(isoStr) {
  const { hour } = parseLocal(isoStr);
  const { h, suffix } = to12Hour(hour);
  return `${h} ${suffix}`;
}

function degToCompass(deg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

// WMO weather interpretation codes used by Open-Meteo.
function describeWeather(code) {
  const codes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Freezing drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Light showers',
    81: 'Showers',
    82: 'Violent showers',
    85: 'Light snow showers',
    86: 'Snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail'
  };
  return codes[code] || 'Unknown';
}

const oops = '<br><p>Sorry, I could not find that location. Please try another city or zip code.</p>';

input.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = input.city.value.trim();
  localStorage.setItem('city', city);
  input.reset();
  input.city.blur();
  forecast.updateCity(city)
    .then(data => updateUI(data))
    .catch(() => updateDetails.innerHTML = oops);
});

if (localStorage.getItem('city')) {
  forecast.updateCity(localStorage.getItem('city'))
    .then(data => updateUI(data))
    .catch(() => updateDetails.innerHTML = oops);
}
