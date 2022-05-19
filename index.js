// search history
let history = []
let previousCity = ""
let key = "542e6ef66e55b397e88fd211d683b33d"

// api call
let cityWeather = function (city) {
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=imperial`
  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          displayWeather(data)

          $(`#city-title`).text(city)
        })
      } else {
        alert("Error: " + response.statusText)
        $(`#${city}`).remove()
      }
    })
    .catch(function (error) {
      alert("Unable to connect to OpenWeather")
    })
}
// search form
let searchSubmitHandler = function (event) {
  event.preventDefault()
  let cityName = $("#city-name").val().trim()
  if (cityName) {
    cityWeather(cityName)
    $("#search-history").append(
      `<a class="btn btn-info mt-2" id="${cityName}">${cityName}</a>`
    )
    $("#city-name").val("")
  } else {
    alert("Please enter a city name")
  }
}

// display weather
let displayWeather = function (Data) {
  $("#city-name")
    .text(Data.name + " (" + dayjs(Data.dt * 1000).format("MM/DD/YYYY") + ") ")
    .append(
      `<img src="https://openweathermap.org/img/wn/${Data.weather[0].icon}@2x.png"></img>`
    )
  $("#temperature").text("Temperature: " + Data.main.temp.toFixed(1) + "°F")
  $("#humidity").text("Humidity: " + Data.main.humidity + "%")
  $("#wind-speed").text("Wind Speed: " + Data.wind.speed.toFixed(1) + " mph")

  // uv api call
  fetch(
    `https://api.openweathermap.org/data/2.5/uvi?lat=${Data.coord.lat}&lon=${Data.coord.lon}&appid=${key}`
  ).then(function (response) {
    response.json().then(function (data) {
      // console.log("uv data ",data);
      // display the uv index value
      $("#uv-index").text("UV Index: " + data.value)
    })
  })

  let call = `https://api.openweathermap.org/data/2.5/onecall?lat=${Data.coord.lat}&lon=${Data.coord.lon}&dt=&appid=${key}`
  console.log("call", call)
  fetch(call).then(function (response) {
    response.json().then(function (data) {
      let uviData = data
      // five-day api call
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${Data.name}&appid=${key}&units=imperial`
      ).then(function (response) {
        response.json().then(function (data) {
          console.log(uviData)
          $("#five-day-forecast").empty()
          let dailycount = 0
          // get every 8th value (24hours) in the returned array from the api call
          for (i = 7; i <= data.list.length; i += 8) {
            dailycount++

            console.log("prev-data", data.list[i])
            let fiveDayCard =
              `
                    <div class="col-md-2 m-2 py-3 card text-dark bg-secondary">
                        <div class="card-body p-1">
                            <h5 class="card-title">` +
              dayjs(data.list[i].dt * 1000).format("MM/DD/YYYY") +
              `</h5>
                            <img src="https://openweathermap.org/img/wn/` +
              data.list[i].weather[0].icon +
              `.png" alt="rain">
                            <h6 class="card-text">Temp: ` +
              data.list[i].main.temp +
              `</h6>
                            <h6 class="card-text">Humidity: ` +
              data.list[i].main.humidity +
              `</h6>
                            <h6 class="card-text">Wind Speed: ` +
              data.list[i].wind.speed +
              " mph" +
              `</h6>
                            <h6 class="card-text" id="uv-index-${i}">UV Index: ` +
              uviData.daily[dailycount].uvi +
              `</h6>
                            </div>
                        </div>`
            $("#five-day-forecast").append(fiveDayCard)
          }
        })
      })
    })
  })
}
// function to load saved city search history from local storage
let loadhistory = function () {
  history = JSON.parse(localStorage.getItem("weatherhistory"))
  previousCity = JSON.parse(localStorage.getItem("previousCity"))
  if (!history) {
    history = []
  }
  if (!previousCity) {
    previousCity = ""
  }
}

loadhistory()

if (previousCity != "") {
  cityWeather(previousCity)
}
$("#search-form").submit(searchSubmitHandler)
$("#search-history").on("click", function (event) {
  let prevCity = $(event.target).closest("a").attr("id")
  cityWeather(prevCity)
})
