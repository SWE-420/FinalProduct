const express = require("express");
const path = require("path");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

//tell the app to use the public file for frontend files
//let the app use json
app.use(express.static("public"));
app.use(express.json());

const API_KEY = process.env.OPENWEATHER_API_KEY;

// Convert city name to lat/lon using Geocoding API
async function getCoordinates(city) {
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
  const response = await fetch(geoUrl);
  const data = await response.json();
  if (!data[0]) throw new Error("City not found");
  return { lat: data[0].lat, lon: data[0].lon, name: data[0].name };
}

// Get weather using One Call API
async function getWeather(lat, lon, units) {
  const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely,hourly,alerts&appid=${API_KEY}`;
  const response = await fetch(weatherUrl);
  if (!response.ok) throw new Error("Weather fetch failed");
  return await response.json();
}

app.post("/weather", async (req, res) => {
  const { city, units = "metric" } = req.body; // units can be 'metric' or 'imperial'
  try {
    const { lat, lon, name } = await getCoordinates(city);
    const weatherData = await getWeather(lat, lon, units);

    const current = weatherData.current;
    const daily = weatherData.daily.slice(0, 5); // 5-day forecast

    res.json({
      city: name,
      current: {
        temp: current.temp,
        condition: current.weather[0].main,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        wind: current.wind_speed,
        humidity: current.humidity,
        uv: current.uvi,
        visibility: current.visibility,
      },
      forecast: daily.map((day) => ({
        dt: day.dt,
        condition: day.weather[0].main,
        icon: day.weather[0].icon,
        high: day.temp.max,
        low: day.temp.min,
      })),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
