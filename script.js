let forecast = [];
let chart;
const language = document.documentElement.lang === "en" ? "en" : "fi";

async function getForecast(city, apiKey) {
  const locations = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
    params: { q: city, limit: 1, appid: apiKey }
  });

  const place = locations.data[0];
  if (!place) return [];

  const response = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
    params: { lat: place.lat, lon: place.lon, units: "metric", appid: apiKey }
  });

  return response.data.list;
}

async function haeSaa() {
  const city = document.querySelector("#kaupunki").value.trim();
  const apiKey = document.querySelector("#apiKey").value.trim();

  if (!city || !apiKey) {
    alert(language === "en" ? "Enter a city and an API key." : "Syötä kaupunki ja API-avain.");
    return;
  }

  $("#saaYllatys").show();

  try {
    forecast = await getForecast(city, apiKey);

    if (forecast.length === 0) {
      alert(language === "en" ? "City not found" : "Kaupunkia ei löytynyt");
      return;
    }

    document.querySelector("#cityName").textContent = city;

    localStorage.setItem("lastCity", city);

    paivitaKaavio();

  } catch (error) {
    console.error(error);

    alert(
      language === "en"
        ? "Could not fetch weather data. Check the API key."
        : "Säädatan haku epäonnistui. Tarkista API-avain."
    );

  } finally {
    $("#saaYllatys").hide();
  }
}

function paivitaKaavio() {
  if (forecast.length === 0) return;

  if (chart) chart.destroy();

  const labels = forecast.map(entry => entry.dt_txt.slice(0, 16));
  const temperatures = forecast.map(entry => entry.main.temp);

  chart = new Chart(document.getElementById("tempChart"), {
    type: document.getElementById("chartType").value,
    data: {
      labels,
      datasets: [{ label: "°C", data: temperatures }]
    }
  });
}

// Own feature: remember the last city
const lastCity = localStorage.getItem("lastCity");

if (lastCity) {
  document.querySelector("#kaupunki").value = lastCity;
}

document.querySelector("#haeSaaPainike").addEventListener("click", haeSaa);