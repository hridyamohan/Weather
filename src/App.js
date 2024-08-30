import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getUserLocation();
  }, []);
  // define the function that finds the users geolocation
  const getUserLocation = async () => {
    // if geolocation is supported by the users browser
    if (navigator.geolocation) {
      // get the current users location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // save the geolocation coordinates in two variables
          const { latitude, longitude } = position.coords;

          // update the value of userlocation variable
          setUserLocation({ latitude, longitude });

          if (latitude && longitude) {
            try {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDEiMQCsYBlGrO5eaOh1BaBWeFNxjHeoek&amp;sensor=false&amp;ver=6.6.1`
              );
              if (!response.ok) {
                throw new Error("Failed to fetch location information");
              }

              const data = await response.json();

              if (data.status === "OK" && data.results.length > 0) {
                const result = data.results[0];

                setLocationInfo({
                  address: result.formatted_address,
                  location: result.address_components[0].long_name,
                });
                fetchLocation(result.address_components[0].long_name);
              }
            } catch (error) {}
          }
        },
        // if there was an error getting the users location
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
    // if geolocation is not supported by the users browser
    else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const fetchLocation = async (loc) => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=470204652b3b4043ad961553242908&q=${loc}&aqi=no`
      );
      const data = await response.json();
      setLocation({
        ...location,
        name: data.location.name,
        region: data.location.region,
        country: data.location.country,
        time: data.location.localtime,
        temperature_c: data.current.temp_c,
        temperature_f: data.current.temp_f,
        current: data.current,
        isDay: data.current.is_day,
        condition: data.current.condition.text,
        conditionIcon: data.current.condition.icon,
        humidity: data.current.humidity,
        cloud: data.current.cloud,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="App">
      {location ? (
        <div
          className={["wrapper", location.isDay ? "day" : "night"].join(" ")}
        >
          <div className="cityName">
            <h1>{location.name}</h1>
            <p>
              {location.region && location.region} {location.country}
            </p>
          </div>
          <div className="time">
            {new Date(location.time).toLocaleString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            <h2>
              {new Date(location.time).toLocaleString("en-GB", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </h2>
          </div>
          <div className="grid">
            <div className="gridBox fullWidth">
              <img src={location.conditionIcon} alt={location.condition} />
              <p>{location.condition}</p>
            </div>
            <div className="gridBox">
              <span>
                Temperature in <sup>o</sup>C
              </span>
              <p>
                {location.temperature_c} <sup>o</sup>C
              </p>
            </div>
            <div className="gridBox">
              <span>Temperature in Fahrenheit</span>
              <p>{location.temperature_f} F</p>
            </div>
            <div className="gridBox">
              <span>Humidity</span>
              <p>{location.humidity}</p>
            </div>
            <div className="gridBox">
              <span>Cloud</span>
              <p>{location.cloud}</p>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
