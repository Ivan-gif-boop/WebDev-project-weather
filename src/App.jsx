import React, { useState, useEffect } from 'react';
import './style.css';

import clear from './videos/clear.mp4';
import rain from './videos/rain.mp4';
import clouds from './videos/clouds.mp4';
import snow from './videos/snow.mp4';
import fog from './videos/fog.mp4';
import thunderstorm from './videos/thunderstorm.mp4';
import defaultVideo from './videos/default.mp4';

const videoMap = {
  clear,
  rain,
  clouds,
  snow,
  fog,
  thunderstorm,
  default: defaultVideo
};

const apiKey = 'c4bb305d97ba3c3c2851ec0c4273bec4';

const facts = [
  "The highest temperature ever recorded on Earth was 56.7°C in California!",
  "Lightning strikes Earth about 8 million times per day.",
  "The coldest temperature ever recorded was -89.2°C in Antarctica.",
  "A hurricane can release the energy of 10,000 nuclear bombs.",
  "Raindrops can fall at speeds of about 35 km/h.",
  "Snowflakes can take up to an hour to fall from the cloud to the ground.",
  "The wettest place on Earth is Mawsynram, India.",
  "Tornadoes can have winds over 480 km/h!"
];

// 🧥 Dressing Advice Logic
function getDressingAdvice(temp, description) {
  if (description.includes("rain")) {
    return "Carry an umbrella or wear a waterproof jacket.";
  } else if (description.includes("snow")) {
    return "Bundle up! Wear a warm coat, gloves, and boots.";
  } else if (temp < 10) {
    return "Wear a heavy jacket or trenchcoat. It’s quite cold.";
  } else if (temp < 18) {
    return "A hoodie or sweater will keep you comfortable.";
  } else if (temp >= 18 && temp <= 26) {
    return "Light clothing is perfect for this weather.";
  } else if (temp > 26) {
    return "It’s hot — wear breathable clothes and stay hydrated!";
  } else {
    return "Dress comfortably. Keep an umbrella just in case!";
  }
}

// 📆 Extract 1 forecast per day from 3-hour data
function extractDailyForecast(forecastList) {
  const dailyMap = {};

  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!dailyMap[date]) {
      dailyMap[date] = item;
    }
  });

  return Object.values(dailyMap).slice(0, 5); // 5-day forecast
}

export default function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [videoSrc, setVideoSrc] = useState(defaultVideo);
  const [fact, setFact] = useState(facts[0]);

  const fetchWeather = async (city) => {
    try {
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
      const [geoData] = await geoRes.json();

      if (!geoData || !geoData.lat || !geoData.lon) {
        alert("City not found.");
        return;
      }

      const lat = geoData.lat;
      const lon = geoData.lon;

      const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
      const json = await res.json();

      const daily = extractDailyForecast(json.list);

      setData({
        current: json.list[0],
        city: city,
        daily
      });

      const mainWeather = json.list[0].weather[0].main.toLowerCase();
      let keyword = 'default';
      if (mainWeather.includes('cloud')) keyword = 'clouds';
      else if (mainWeather.includes('rain') || mainWeather.includes('drizzle')) keyword = 'rain';
      else if (mainWeather.includes('clear')) keyword = 'clear';
      else if (mainWeather.includes('snow')) keyword = 'snow';
      else if (mainWeather.includes('fog') || mainWeather.includes('mist') || mainWeather.includes('haze')) keyword = 'fog';
      else if (mainWeather.includes('thunderstorm')) keyword = 'thunderstorm';

      setVideoSrc(videoMap[keyword] || videoMap['default']);
      setFact(facts[Math.floor(Math.random() * facts.length)]);
    } catch (error) {
      alert("Failed to fetch forecast.");
    }
  };

  const fetchLocationWeather = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`);
        const json = await res.json();

        const daily = extractDailyForecast(json.list);

        setData({
          current: json.list[0],
          city: "Your location",
          daily
        });

        const mainWeather = json.list[0].weather[0].main.toLowerCase();
        let keyword = 'default';
        if (mainWeather.includes('cloud')) keyword = 'clouds';
        else if (mainWeather.includes('rain') || mainWeather.includes('drizzle')) keyword = 'rain';
        else if (mainWeather.includes('clear')) keyword = 'clear';
        else if (mainWeather.includes('snow')) keyword = 'snow';
        else if (mainWeather.includes('fog') || mainWeather.includes('mist') || mainWeather.includes('haze')) keyword = 'fog';
        else if (mainWeather.includes('thunderstorm')) keyword = 'thunderstorm';

        setVideoSrc(videoMap[keyword] || videoMap['default']);
        setFact(facts[Math.floor(Math.random() * facts.length)]);
      } catch (error) {
        alert("Failed to fetch location forecast.");
      }
    });
  };

  return (
    <>
      <video key={videoSrc} autoPlay muted loop playsInline id="bg-video">
        <source src={videoSrc} type="video/mp4" />
      </video>

      <div className="weather-container">
        <div className="search-bar">
          <input
            type="text"
            className="city-input"
            placeholder="Enter a city..."
            value={city}
            onChange={e => setCity(e.target.value)}
          />
          <button className="search-btn" onClick={() => fetchWeather(city)}>🔍</button>
          <button className="location-btn" onClick={fetchLocationWeather}>📍</button>
        </div>

        {data && (
          <>
            <div className="current-weather">
              <div className="weather-main">
                <div className="weather-icon">☁</div>
                <div className="temp-info">
                  <h2>{Math.round(data.current.main.temp)}°C</h2>
                  <p className="description">{data.current.weather[0].description}</p>
                  <p className="humidity">Humidity: {data.current.main.humidity}%</p>
                  <p className="wind">Wind: {data.current.wind.speed} km/h</p>
                </div>
              </div>
              <div className="weather-location">
                <h3 className="city-name">{data.city}</h3>
              </div>
              <div className="weather-fact">
                <h4>Did You Know?</h4>
                <p className="fact-text">{fact}</p>
              </div>
            </div>

            <div className="dressing-advice">
              <h4>👗 Dressing Advice:</h4>
              <p>
                {getDressingAdvice(
                  Math.round(data.current.main.temp),
                  data.current.weather[0].description.toLowerCase()
                )}
              </p>
            </div>

            <div className="forecast-section">
              <h4>5-Day Forecast</h4>
              <div className="forecast-grid">
                {data.daily.map((day, index) => {
                  const date = new Date(day.dt * 1000);
                  const options = { weekday: 'short' };
                  const dayName = date.toLocaleDateString('en-US', options);

                  return (
                    <div className="forecast-card" key={index}>
                      <p className="day">{dayName}</p>
                      <img
                        src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                        alt={day.weather[0].description}
                      />
                      <p className="temps">
                        {Math.round(day.main.temp_min)}° / {Math.round(day.main.temp_max)}°
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
