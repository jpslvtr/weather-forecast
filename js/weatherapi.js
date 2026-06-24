class Forecast {
  constructor() {
    // Open-Meteo: free, no API key required, CORS enabled in the browser.
    this.geocodeURI = 'https://geocoding-api.open-meteo.com/v1/search'
    this.forecastURI = 'https://api.open-meteo.com/v1/forecast'
  }
  async updateCity(city) {
    const location = await this.getLocation(city)
    const weather = await this.getWeather(location.latitude, location.longitude)
    return { location, weather }
  }
  async getLocation(city) {
    const query = `?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    const response = await fetch(this.geocodeURI + query)
    const data = await response.json()
    if (!data.results || data.results.length === 0) {
      throw new Error('Location not found')
    }
    return data.results[0]
  }
  async getWeather(latitude, longitude) {
    const params = [
      `latitude=${latitude}`,
      `longitude=${longitude}`,
      'current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,precipitation',
      'hourly=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,precipitation_probability',
      'daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant',
      'temperature_unit=fahrenheit',
      'wind_speed_unit=mph',
      'precipitation_unit=inch',
      'timezone=auto',
      'forecast_hours=24',
      'forecast_days=7'
    ].join('&')
    const response = await fetch(`${this.forecastURI}?${params}`)
    return await response.json()
  }
}
