const input = document.querySelector('.input-location');
// const currentLocation = document.getElementById('.getLocation');
const updateDetails = document.querySelector('.updateDetails');
const forecast = new Forecast();
const updateUI = (data) => {
    // destructure properties
    // const { cityData, current, twelve, minuteCast } = data;
    const { cityData, current, twelve } = data;
    // console.log(JSON.stringify(twelve[0],null,2));
    // console.log(JSON.stringify(current,null,2));
    // console.log(data)


    // 12 hour data
    var myHash = new Object();
    for(var i=0; i<twelve.length; i++) {
      var myTime = getSimpleTime(twelve[i]);
      var myTemp = getTemp(twelve[i]);
      var myWeather = getWeather(twelve[i]);
      var windSpeed = getWindSpeed(twelve[i]);
      var windDirection = getWindDirection(twelve[i]);
      myHash[i] = [myTime, myTemp, myWeather, windSpeed, windDirection];
    }

    // current data
    var currentDate = getCurrentTime(current)[0];
    var currentTime = getCurrentTime(current)[1];
    var currentTemp = current.Temperature.Imperial.Value + " &deg;F";
    var currentWeather = getCurrentWeather(current);
    var currentWindSpeed = current.Wind.Speed.Imperial.Value + " mph";
    var currentWindDirection = current.Wind.Direction.English;
    // get sunrise and sunset
    var latitude = (cityData.GeoPosition['Latitude']);
    var longitude = (cityData.GeoPosition['Longitude']);
    var fs1 = "https://api.sunrise-sunset.org/json?lat=";
    var fs2 = fs1 + latitude + "&lng=" + longitude + "&formatted=0";
    var sundata;
    fetch(fs2)
      .then(res => res.json())
      .then(sundata => {
        sunrise = new Date(sundata.results.sunrise);
        sunrise = formatTime(sunrise);
        sunset = new Date(sundata.results.sunset);
        sunset = formatTime(sunset)

        // print tables
        var html1 = `<br>
        Location: ${cityData.EnglishName},&nbsp;${cityData.AdministrativeArea.EnglishName}<br>
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
          <tr>
            <td>${currentTime}</td>
            <td>${currentTemp}</td>
            <td>${currentWeather}</td>
            <td>${currentWindDirection} ${currentWindSpeed}</td>
          </tr>`
        var html2 = ''
        for(var i in myHash) {
          html2 += `<tr>
                    <td>${myHash[i][0]}</td>
                    <td>${myHash[i][1]}</td>
                    <td>${myHash[i][2]}</td>
                    <td>${myHash[i][4]} ${myHash[i][3]}</td>
                  </tr>`
        }
        var html3 = `</table>`
        updateDetails.innerHTML = html1 + html2 + html3

        function formatTime(date) {
          var minutes = ("0" + date.getMinutes()).slice(-2);
          var hours = date.getHours();
          var suffix = (hours >= 12) ? 'PM' : 'AM';
          hours = (hours > 12) ? hours - 12 : hours; // only -12 from hours if it is greater than 12 (if not, back at mid night)
          hours = (hours == '00') ? 12 : hours; // if 00 then it is 12 am
          var myTime = hours + ":" + minutes + " " + suffix
          return myTime.toString()
        }
      })
}

function getCurrentTime(date) {
  var date = new Date(date.EpochTime*1000);
  var year = date.getFullYear();
  var month = date.getMonth()+1;
  var day = date.getDate();
  var hours = date.getHours();
  var suffix = (hours >= 12) ? 'PM' : 'AM';
  hours = (hours > 12) ? hours - 12 : hours; // only -12 from hours if it is greater than 12 (if not, back at mid night)
  hours = (hours == '00') ? 12 : hours; // if 00 then it is 12 am
  var minutes = ("0" + date.getMinutes()).slice(-2);

  var first = month + "/" + day + "/" + year;
  var second = hours + ":" + minutes + " " + suffix;
  return [first, second];
}


function getSimpleTime(date) {
  var date = new Date(date.EpochDateTime*1000);
  var hours = date.getHours();
  var suffix = (hours >= 12) ? 'PM' : 'AM';
  hours = (hours > 12) ? hours - 12 : hours; // only -12 from hours if it is greater than 12 (if not, back at mid night)
  hours = (hours == '00') ? 12 : hours; // if 00 then it is 12 am
  return hours + " " + suffix;
}

function getTemp(temp) {
  return temp.Temperature.Value + " &deg;F";
}

function getCurrentWeather(weather) {
  var precip = weather.WeatherText;
  if (weather.HasPrecipitation == true) {
    precip += "<br>Accumulation: " + weather.PrecipitationSummary.PastHour.Imperial.Value + " in (past hour)"
  }
  return precip
}


function getWeather(weather) {
  var precip;
  if (weather.HasPrecipitation == true) {
    precip = weather.PrecipitationIntensity + " " + weather.PrecipitationType + ", " + weather.PrecipitationProbability + "%<br>";
    precip += "Accumulation: " + weather.TotalLiquid.Value + " in";
  } else {
    precip = weather.IconPhrase;
  }
  return precip
}

function getWindSpeed(weather) {
  return weather.Wind.Speed.Value + " mph";
}

function getWindDirection(weather) {
  return weather.Wind.Direction.English;
}

var oops = '<br><p>Sorry, I only have the free version of AccuWeather\'s API. <br> Perhaps one day I\'ll upgrade.</p>'

input.addEventListener('submit',(e) => {
    e.preventDefault()
    const city = input.city.value.trim()
    localStorage.setItem('city', city)
    input.reset()
    input.city.blur()
    forecast.updateCity(city).then(data => updateUI(data))
      .catch(err => console.log(err))
      .catch(err => updateDetails.innerHTML=oops)
})

if(localStorage.getItem('city')) {
  forecast.updateCity(localStorage.getItem('city'))
    .then(data => updateUI(data))
    .catch(err => console.log(err))
}