// DOM Elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const errorMsg = document.getElementById("errorMsg");
const weatherDisplay = document.getElementById("weatherDisplay");
const defaultMessage = document.getElementById("defaultMessage");
const weatherBackground = document.getElementById("weatherBackground");
const rainBackground = document.getElementById("rainBackground");

// Temperature toggle buttons
const toggleC = document.getElementById("toggleC");
const toggleF = document.getElementById("toggleF");

// Current weather elements
const currentCity = document.getElementById("currentCity");
const currentDate = document.getElementById("currentDate");
const currentCondition = document.getElementById("currentCondition");
const currentTemp = document.getElementById("currentTemp");
const currentHigh = document.getElementById("currentHigh");
const currentLow = document.getElementById("currentLow");
const currentWeatherIcon = document.getElementById("currentWeatherIcon");

// Weather info elements
const windSpeed = document.getElementById("windSpeed");
const humidity = document.getElementById("humidity");
const uvIndex = document.getElementById("uvIndex");
const visibility = document.getElementById("visibility");

let isCelsius = true;
let weatherData = null;

searchBtn.addEventListener("click", handleSearch);
cityInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") handleSearch();
});

toggleC.addEventListener("click", () => {
  if (!isCelsius) {
    isCelsius = true;
    fetchWeatherAgain();
    toggleTemperatureUnit();
  }
});

toggleF.addEventListener("click", () => {
  if (isCelsius) {
    isCelsius = false;
    fetchWeatherAgain();
    toggleTemperatureUnit();
  }
});

function fetchWeatherAgain() {
  const city = cityInput.value.trim();
  if (city) handleSearch();
}

async function handleSearch() {
  const city = cityInput.value.trim();
  const units = isCelsius ? "metric" : "imperial";

  if (city === "") {
    errorMsg.classList.remove("hidden");
    return;
  }

  errorMsg.classList.add("hidden");

  try {
    const res = await fetch("/weather", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, units }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    weatherData = data;
    updateWeatherDisplay();
    updateWeatherBackground();
    defaultMessage.classList.add("hidden");
    weatherDisplay.classList.remove("hidden");
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.classList.remove("hidden");
    weatherDisplay.classList.add("hidden");
  }
}

function updateWeatherDisplay() {
  const current = weatherData.current;
  currentCity.textContent = weatherData.city;
  currentDate.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  currentCondition.textContent = current.description;
  currentTemp.textContent = Math.round(current.temp);
  currentHigh.textContent = `H: ${Math.round(weatherData.forecast[0].high)}°`;
  currentLow.textContent = `L: ${Math.round(weatherData.forecast[0].low)}°`;

  windSpeed.textContent = `${current.wind} ${isCelsius ? "km/h" : "mph"}`;
  humidity.textContent = `${current.humidity}%`;
  uvIndex.textContent = current.uv;
  visibility.textContent = `${(current.visibility / 1000).toFixed(1)} km`;

  currentWeatherIcon.innerHTML = "";
  const icon = createWeatherIcon(current.condition.toLowerCase());
  currentWeatherIcon.appendChild(icon);

  const forecastCards = document.querySelectorAll(".weather-card");
  weatherData.forecast.forEach((day, index) => {
    const card = forecastCards[index];
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    card.querySelector("p").textContent = dayName;

    const iconContainer = card.querySelector(".my-3 > div");
    iconContainer.className = "";
    iconContainer.innerHTML = "";
    const forecastIcon = createWeatherIcon(day.condition.toLowerCase());
    iconContainer.appendChild(forecastIcon);

    const temps = card.querySelectorAll("span");
    temps[0].textContent = `${Math.round(day.high)}°`;
    temps[1].textContent = `${Math.round(day.low)}°`;
  });
}

function updateWeatherBackground() {
  const condition = weatherData.current.condition.toLowerCase();
  weatherBackground.classList.remove(
    "sunny-bg",
    "rainy-bg",
    "cloudy-bg",
    "default-bg"
  );

  if (condition.includes("rain")) {
    weatherBackground.classList.add("rainy-bg");
    rainBackground.classList.remove("hidden");
    createRainBackground();
  } else if (condition.includes("cloud")) {
    weatherBackground.classList.add("cloudy-bg");
    rainBackground.classList.add("hidden");
  } else {
    weatherBackground.classList.add("sunny-bg");
    rainBackground.classList.add("hidden");
  }
}

function createRainBackground() {
  rainBackground.innerHTML = "";
  for (let i = 0; i < 100; i++) {
    const rainDrop = document.createElement("div");
    rainDrop.className = "rain-drop";
    const left = Math.random() * 100;
    const animationDuration = 0.5 + Math.random() * 1.5;
    const animationDelay = Math.random() * 2;
    const height = 20 + Math.random() * 30;

    rainDrop.style.left = `${left}%`;
    rainDrop.style.height = `${height}px`;
    rainDrop.style.animationDuration = `${animationDuration}s`;
    rainDrop.style.animationDelay = `${animationDelay}s`;

    rainBackground.appendChild(rainDrop);
  }
}

function toggleTemperatureUnit() {
  if (isCelsius) {
    toggleC.classList.add("bg-blue-600");
    toggleC.classList.remove("bg-blue-500");
    toggleF.classList.add("bg-blue-500");
    toggleF.classList.remove("bg-blue-600");
  } else {
    toggleC.classList.add("bg-blue-500");
    toggleC.classList.remove("bg-blue-600");
    toggleF.classList.add("bg-blue-600");
    toggleF.classList.remove("bg-blue-500");
  }
}

function createWeatherIcon(condition) {
  const container = document.createElement("div");
  container.className = "w-24 h-24 flex items-center justify-center";

  if (condition.includes("sun") || condition.includes("clear")) {
    const sunny = document.createElement("div");
    sunny.className = "sunny";
    container.appendChild(sunny);
  } else if (condition.includes("rain")) {
    const rainy = document.createElement("div");
    rainy.className = "rainy";
    rainy.innerHTML = `
            <div class="rain" style="left: 10px; animation-delay: 0s;"></div>
            <div class="rain" style="left: 30px; animation-delay: 0.2s;"></div>
            <div class="rain" style="left: 50px; animation-delay: 0.4s;"></div>
            <div class="rain" style="left: 70px; animation-delay: 0.6s;"></div>
            <div class="rain" style="left: 90px; animation-delay: 0.8s;"></div>
        `;
    container.appendChild(rainy);
  } else if (condition.includes("cloud")) {
    const cloudy = document.createElement("div");
    cloudy.className = "cloudy";
    container.appendChild(cloudy);
  } else {
    const defaultIcon = document.createElement("div");
    defaultIcon.className = "sunny";
    container.appendChild(defaultIcon);
  }

  return container;
}

// Initial toggle state
toggleC.classList.add("bg-blue-600");
toggleF.classList.add("bg-blue-500");
