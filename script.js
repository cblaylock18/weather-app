// api keys
const weatherApiKey = "BKCM3AQLPSDCTQ6XRKB7E4LLX";
const giphyApiKey = "nY249DEnLK1QJYhYyJscb5jDdUIXND84";

// document selectors
const weatherDataDisplay = document.querySelector(".weather-data");
const weatherDisplayLocation = weatherDataDisplay.querySelector(".location");
const weatherDisplayToday = weatherDataDisplay.querySelector(".today");
const weatherDisplayIcon = weatherDisplayToday.querySelector(".icon");
const weatherDisplayTemp = weatherDisplayToday.querySelector(".temp");
const weatherDisplayFeelsLike =
    weatherDisplayToday.querySelector(".feels-like");
const weatherDisplayHumidity = weatherDisplayToday.querySelector(".humidity");
const weatherDisplayUVIndex = weatherDisplayToday.querySelector(".uv-index");

const weatherDisplayFuture =
    weatherDataDisplay.querySelector(".next-five-days");

// mapping arrays
const weatherConditionGroups = {
    Clear: ["Clear", "Diamond Dust"],
    PartlyCloudy: [
        "Partially cloudy",
        "Sky Coverage Decreasing",
        "Sky Coverage Increasing",
        "Sky Unchanged",
    ],
    Overcast: ["Overcast"],
    FoggyOrHazy: ["Fog", "Mist", "Freezing Fog", "Smoke Or Haze"],
    LightRain: [
        "Drizzle",
        "Light Drizzle",
        "Light Rain",
        "Light Drizzle/Rain",
        "Precipitation In Vicinity",
    ],
    HeavyRain: [
        "Heavy Drizzle",
        "Heavy Rain",
        "Heavy Drizzle/Rain",
        "Rain",
        "Rain Showers",
        "Hail Showers",
    ],
    Thunderstorm: [
        "Thunderstorm",
        "Thunderstorm Without Precipitation",
        "Lightning Without Thunder",
    ],
    Snow: [
        "Light Snow",
        "Snow",
        "Heavy Snow",
        "Snow Showers",
        "Blowing Or Drifting Snow",
        "Snow And Rain Showers",
        "Heavy Rain And Snow",
        "Light Rain And Snow",
    ],
    FreezingRainOrSleet: [
        "Freezing Drizzle/Freezing Rain",
        "Light Freezing Drizzle/Freezing Rain",
        "Heavy Freezing Drizzle/Freezing Rain",
        "Light Freezing Rain",
        "Heavy Freezing Rain",
        "Ice",
    ],
    Hail: ["Hail", "Hail Showers"],
    Windy: ["Squalls"],
    DustStorm: ["Dust Storm"],
    Tornado: ["Funnel Cloud/Tornado"],
};

function getDayOfWeek(dateString) {
    // Split the date string into components (year, month, day)
    const [year, month, day] = dateString.split("-").map(Number);

    // Create a new Date object (month index starts from 0 in JavaScript)
    const date = new Date(year, month - 1, day);

    // Array of day names
    const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    // Get the day of the week (0 = Sunday, 6 = Saturday)
    const dayIndex = date.getDay();

    // Return the name of the day
    return daysOfWeek[dayIndex];
}

const form = document.querySelector("form");
const searchLocation = document.querySelector("#location-search");
const searchBtn = document.querySelector("button");

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const location = searchLocation.value.trim();

    if (form.checkValidity() === false) {
        form.reportValidity();
        return;
    } else if (location) {
        displayWeatherData(location);
        searchLocation.value = "";
    } else {
        alert("There was an error! Try reloading the page.");
    }
});

async function getWeatherData(location) {
    const response = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=${weatherApiKey}`
    );

    if (!response.ok) {
        console.error("Error fetching weather data:", response.statusText);
        return;
    }

    const weatherData = await response.json();
    return processWeatherData(weatherData);
}

const processWeatherData =
    function takeInfoFromWeatherDataAndExtractOnlyWhatINeed(weatherData) {
        const processedWeatherData = {
            location: weatherData["resolvedAddress"],
            date: getDayOfWeek(weatherData["days"][0]["datetime"]),
            currentTemp: weatherData["currentConditions"]["temp"],
            currentConditions: weatherData["currentConditions"]["conditions"],
            currentFeelsLike: weatherData["currentConditions"]["feelslike"],
            currentHumidity: weatherData["currentConditions"]["humidity"],
            currentUVIndex: weatherData["currentConditions"]["uvindex"],
            nextFiveDays: [],
        };

        for (let i = 1; i <= 5; i++) {
            processedWeatherData.nextFiveDays.push({
                date: getDayOfWeek(weatherData["days"][i]["datetime"]),
                conditions: weatherData["days"][i]["conditions"],
                maxTemp: weatherData["days"][i]["tempmax"],
                minTemp: weatherData["days"][i]["tempmin"],
            });
        }
        return processedWeatherData;
    };

async function displayWeatherData(location) {
    try {
        const processedWeatherData = await getWeatherData(location);

        if (processedWeatherData) {
            //update today's weather
            weatherDisplayLocation.textContent = processedWeatherData.location;
            updateWeatherGif(
                weatherDisplayIcon,
                processedWeatherData.currentConditions
            );
            weatherDisplayTemp.textContent = `Currently ${processedWeatherData.currentTemp} F`;
            weatherDisplayFeelsLike.textContent = `Feels like ${processedWeatherData.currentFeelsLike} F`;
            weatherDisplayHumidity.textContent = `Humidity: ${processedWeatherData.currentHumidity}%`;
            weatherDisplayUVIndex.textContent = `UV Index ${processedWeatherData.currentUVIndex}`;

            // update next 5 days weather
            for (let i = 1; i <= 5; i++) {
                const weatherDisplayDay = weatherDisplayFuture.querySelector(
                    `.future-day-${i}`
                );
                weatherDisplayDay.querySelector(".day").textContent =
                    processedWeatherData.nextFiveDays[i - 1].date;
                weatherDisplayDay.querySelector(".min").textContent = `High ${
                    processedWeatherData.nextFiveDays[i - 1].maxTemp
                } F`;
                weatherDisplayDay.querySelector(".max").textContent = `Low ${
                    processedWeatherData.nextFiveDays[i - 1].minTemp
                } F`;
                updateWeatherGif(
                    weatherDisplayDay.querySelector(".icon"),
                    processedWeatherData.nextFiveDays[i - 1].conditions
                );
            }
        }
    } catch (error) {
        console.error(error);
        alert("There was an error! Try reloading the page.");
    }
}

async function getWeatherGif(conditions) {
    try {
        const response = await fetch(
            `https://api.giphy.com/v1/gifs/translate?api_key=${giphyApiKey}&s=${conditions}`,
            { mode: "cors" }
        );

        if (!response.ok) {
            console.error("Error fetching giphy data:", response.statusText);
            return;
        }

        const weatherGifData = await response.json();

        if (weatherGifData.data.images.original.url) {
            return weatherGifData.data.images.original.url;
        } else {
            console.error("Error fetching giphy data:", response.statusText);
            return;
        }
    } catch (error) {
        console.error("Error in getWeatherGif:", error);
        alert(
            "There was an error fetching the weather GIF. Please try again later."
        );
    }
}

async function updateWeatherGif(displayLocationToUpdate, conditions) {
    displayLocationToUpdate.src =
        "https://media.giphy.com/media/xTk9ZvMnbIiIew7IpW/giphy.gif?cid=790b76114x3cwv00hwfhuz5i6jlo1ned1u2jag23kcggnql2&ep=v1_gifs_search&rid=giphy.gif&ct=g";

    const gifUrl = await getWeatherGif(conditions);

    if (gifUrl) {
        displayLocationToUpdate.src = gifUrl;
    } else {
        displayLocationToUpdate.src = "./img/weather.jpg";
    }
}
