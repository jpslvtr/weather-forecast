const input = document.querySelector('.input-location');
const updateDetails = document.querySelector('.updateDetails');
const forecast = new Forecast();

const TABS = [
  { id: 'h12', label: '12 Hours' },
  { id: 'h24', label: '24 Hours' },
  { id: 'd3', label: '3 Days' },
  { id: 'd7', label: 'This Week' }
];

let activeTab = localStorage.getItem('tab') || 'h12';

const updateUI = (data) => {
  const { location, weather } = data;
  const current = weather.current;

  const locationName = location.admin1
    ? `${location.name}, ${location.admin1}`
    : location.name;

  const header = `<br>
    <h4 class="bold">${locationName}</h4>
    <div class="wx-current">
      ${formatDate(current.time)}, ${formatTime(current.time)} &middot;
      ${formatTemp(current.temperature_2m)} &middot;
      ${describeWeather(current.weather_code)}<br>
      Feels like ${formatTemp(current.apparent_temperature)} &middot;
      Humidity ${current.relative_humidity_2m}% &middot;
      Wind ${degToCompass(current.wind_direction_10m)} ${formatWind(current.wind_speed_10m)}
    </div>`;

  const panels = {
    h12: hourlyTable(weather, 12),
    h24: hourlyTable(weather, 24),
    d3: dailyCards(weather, 3),
    d7: dailyCards(weather, 7)
  };

  if (!panels[activeTab]) activeTab = 'h12';

  const tabBar = TABS.map(t =>
    `<button type="button" class="wx-tab${t.id === activeTab ? ' active' : ''}" data-tab="${t.id}">${t.label}</button>`
  ).join('');

  const panelHtml = TABS.map(t =>
    `<div class="wx-panel${t.id === activeTab ? ' active' : ''}" data-panel="${t.id}">${panels[t.id]}</div>`
  ).join('');

  updateDetails.innerHTML = `${header}
    <div class="wx-tabs">${tabBar}</div>
    ${panelHtml}`;

  updateDetails.querySelectorAll('.wx-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
};

function switchTab(id) {
  activeTab = id;
  localStorage.setItem('tab', id);
  updateDetails.querySelectorAll('.wx-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === id);
  });
  updateDetails.querySelectorAll('.wx-panel').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.panel === id);
  });
}

function hourlyTable(weather, count) {
  const current = weather.current;
  const hourly = weather.hourly;

  let rows = `<tr>
      <td>Now</td>
      <td>${formatTemp(current.temperature_2m)}</td>
      <td>${describeWeather(current.weather_code)}</td>
      <td>${degToCompass(current.wind_direction_10m)} ${formatWind(current.wind_speed_10m)}</td>
    </tr>`;

  const limit = Math.min(count, hourly.time.length);
  for (let i = 0; i < limit; i++) {
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

  return `<table class="table table-striped table-bordered table-condensed">
      <tr>
        <td>Time</td>
        <td>Temp</td>
        <td>Weather</td>
        <td>Wind</td>
      </tr>
      ${rows}
    </table>`;
}

function dailyCards(weather, count) {
  const daily = weather.daily;
  const limit = Math.min(count, daily.time.length);
  let cards = '';
  for (let i = 0; i < limit; i++) {
    const high = Math.round(daily.temperature_2m_max[i]);
    const low = Math.round(daily.temperature_2m_min[i]);
    const chance = daily.precipitation_probability_max[i];
    const amount = daily.precipitation_sum[i];
    const wind = Math.round(daily.wind_speed_10m_max[i]);
    const windDir = degToCompass(daily.wind_direction_10m_dominant[i]);
    const sunrise = formatTime(daily.sunrise[i]);
    const sunset = formatTime(daily.sunset[i]);

    cards += `<div class="wx-day">
        <h5 class="bold">${dayLabel(daily.time[i], i)} &middot; ${describeWeather(daily.weather_code[i])}</h5>
        <p>${daySummary(daily, i, high, low, chance, wind, windDir, sunrise, sunset)}</p>
        <div class="smallerfont">
          High ${high}&deg; / Low ${low}&deg;F &middot;
          Rain ${chance}%${amount > 0 ? `, ${amount.toFixed(2)} in` : ''} &middot;
          Wind ${windDir} up to ${wind} mph &middot;
          Sunrise ${sunrise} / Sunset ${sunset}
        </div>
      </div>`;
  }
  return cards;
}

function daySummary(daily, i, high, low, chance, wind, windDir, sunrise, sunset) {
  const desc = describeWeather(daily.weather_code[i]);
  let s = `${desc} with a high of ${high}&deg;F and a low of ${low}&deg;F. `;
  s += `${precipPhrase(chance)}. `;
  s += `Winds from the ${windDir} reaching up to ${wind} mph. `;
  s += `The sun rises at ${sunrise} and sets at ${sunset}.`;
  return s;
}

function precipPhrase(chance) {
  if (chance == null) return 'Precipitation chance is unavailable';
  if (chance < 10) return 'Little to no rain is expected';
  if (chance < 30) return `A slight chance of rain (${chance}%)`;
  if (chance < 60) return `A chance of rain (${chance}%)`;
  return `Rain is likely (${chance}%)`;
}

function formatTemp(value) {
  return Math.round(value) + " &deg;F";
}

function formatWind(value) {
  return Math.round(value) + " mph";
}

// Open-Meteo returns location-local times as ISO strings without an offset
// (for example "2026-06-24T16:15", or "2026-06-24" for daily values). Parse the
// parts directly so the browser's timezone never shifts the displayed value.
function parseLocal(isoStr) {
  const [datePart, timePart = '00:00'] = isoStr.split('T');
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

function dayLabel(isoDate, index) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const { year, month, day } = parseLocal(isoDate);
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekday = names[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${weekday}, ${month}/${day}`;
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
