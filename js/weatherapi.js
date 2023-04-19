class Forecast {
    constructor() {
        this.apiKey = 'FPk1gn6mGZmTRmnWU5lcleGi7STN7JR0' // core weather free
        // this.apiKey = 'ZSsIVu36JY9J2H4lu3oouyNDcxOpipNQ' // core weather paid
        // this.apiKeyWeather = 'L8YuGgBA8aidhP3EbKNeG3bAbNyCgSZs' // minutecast
        // this.windyAPI = 'o3ld3C4KYsUV5rodHOhWNVhzWqHK5lZr'
        this.cityURI = 'https://dataservice.accuweather.com/locations/v1/cities/search'
        this.currentURI = 'https://dataservice.accuweather.com/currentconditions/v1/'
        this.twelveURI = 'https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/'
        // this.windyURI = 'https://api.windy.com/api/point-forecast/v2'
        // this.minuteCastURI = 'https://dataservice.accuweather.com/forecasts/v1/minute'
    }
    async updateCity(city) {
      const cityData = await this.getCity(city)
      const current = await this.getCurrent(cityData.Key)
      const twelve = await this.getTwelve(cityData.Key)
      // const minuteCast = await this.getMinuteCast(cityData.GeoPosition)
      // return { cityData, current, twelve, minuteCast }
      return { cityData, current, twelve }
    }
    async getCity(city) {
      const query = `?apikey=${this.apiKey}&q=${city}`
      const response = await fetch(this.cityURI+query)
      const data = await response.json()
      return data[0]
    }
    async getCurrent(key) {
      const query = `${key}?details=true&apikey=${this.apiKey}`
      const response = await fetch(this.currentURI+query)
      const data = await response.json()
      return data[0]
    }
    async getTwelve(key) {
      const query = `${key}?details=true&apikey=${this.apiKey}`
      const response = await fetch(this.twelveURI+query)
      const data = await response.json()
      return data
    }
    // async getMinuteCast(geo) {
    //   var lat = (geo['Latitude']).toFixed(1)
    //   var long = (geo['Longitude']).toFixed(1)
    //   const query = `?q=${lat},${long}&apikey=${this.apiKeyWeather}`
    //   const response = await fetch(this.minuteCastURI+query)
    //   const data = await response.json()
    //   return data
    // }
}
