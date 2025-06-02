import { useState } from 'react';
import snow from '../assets/snow.jpg';
import './Weather.css';
const WeatherDetails = ({ icon, city, temp, desc, humidity, wind, feelsLike, pressure }) => (
  <div className='weather-details glass'>
    <div className='weather-icon'>
      <img src={icon || snow} alt="weather condition" />
    </div>
    {city && (
      <div className='weather-info'>
        <h2>{city}</h2>
        <h3>{temp}°C</h3>
        <p>{desc}</p>
        <ul className="extra-details">
          <li><strong>Humidity:</strong> {humidity}%</li>
          <li><strong>Wind:</strong> {wind} m/s</li>
          <li><strong>Feels Like:</strong> {feelsLike}°C</li>
          <li><strong>Pressure:</strong> {pressure} hPa</li>
        </ul>
      </div>
    )}
  </div>
);

const getBackgroundClass = (desc) => {
  if (!desc) return 'default-bg';
  const d = desc.toLowerCase();
  if (d.includes('rain')) return 'rain-bg';
  if (d.includes('cloud')) return 'cloud-bg';
  if (d.includes('snow')) return 'snow-bg';
  if (d.includes('clear')) return 'clear-bg';
  return 'default-bg';
};

export const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState({
    icon: snow,
    city: '',
    temp: '',
    desc: '',
    humidity: '',
    wind: '',
    feelsLike: '',
    pressure: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInput = (e) => setCity(e.target.value);

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const apiKey = 'd350894bd63fdbfce0a58b310eb5d570'; 
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

      const res = await fetch(url);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'City not found');
      }
      
      const data = await res.json();
      if (!data.weather || !data.weather[0] || !data.main) {
        throw new Error('Invalid weather data received.');
      }
      const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

      setWeather({
        icon: iconUrl,
        city: data.name,
        temp: Math.round(data.main.temp),
        desc: data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1),
        humidity: data.main.humidity,
        wind: data.wind.speed,
        feelsLike: Math.round(data.main.feels_like),
        pressure: data.main.pressure,
      });
      
    } catch (err) {
      console.error('API Error:', err);
      setError(
        err.message.toLowerCase().includes('city not found') || err.message.includes('404')
          ? 'City not found. Please check spelling.'
          : 'Failed to fetch weather data. Please try again.'
      );
      setWeather({
        icon: snow,
        city: '',
        temp: '',
        desc: '',
        humidity: '',
        wind: '',
        feelsLike: '',
        pressure: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') fetchWeather();
  };

  return (
    <div className={`weather-app ${getBackgroundClass(weather.desc)}`}>
      <h1>Weather Forecast</h1>
      <div className="search-container">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button 
            onClick={fetchWeather}
            disabled={loading}
            className="search-button"
          >
            {loading ? (
              <span className="loading-spinner">Loading...</span>
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
      <WeatherDetails
        icon={weather.icon}
        city={weather.city}
        temp={weather.temp}
        desc={weather.desc}
        humidity={weather.humidity}
        wind={weather.wind}
        feelsLike={weather.feelsLike}
        pressure={weather.pressure}
      />
    </div>
  );
};