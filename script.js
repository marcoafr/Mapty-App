'use strict';

// Creating the Workout class (Parent class for running and cycling)
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10); // Creating a 'random' id
  // A clicks counter
  clicks = 0;

  constructor(coords, distance, duration) {
    // this.date = ...
    // this.id = ...
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in minutes
  }

  _setDescription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

// Running class -> Child of Workout
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

// Cycling class -> Child of Workout
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/hour
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// Test -> creating new intances of the classes
// const run1 = new Running([-22.3154, -49.0615], 5.2, 24, 178);
// const ciclying1 = new Cycling([-22.3154, -49.0615], 27, 95, 523);
// console.log(run1, ciclying1); // They work fine! 😁

/////////////////////////////////////////// Application Architecture ///////////////////////////////////////
// Declaring variables (inputs)
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Creating the App class (app functionalities)
class App {
  // Private instance properties and workouts empty array list
  #map;
  #mapEvent;
  #mapZoomLevel = 13;
  #workouts = [];

  constructor() {
    // Starting the application itself as soon as the object is created
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));

    // When we change from running to ciclyng, it should change from cadence to elevation
    // There's no need to .bind, becausen we don't use the this keyword on the toggleElevationField
    inputType.addEventListener('change', this._toggleElevationField);

    // Creating an event handler to move map to workout, whenever clicked
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getPosition() {
    // We should first test if the navigator.geolocation API exists (old browsers don't support them)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Could not get user's position! 🚫");
        }
      );
    }
  }

  _loadMap(position) {
    // Implementing Geolocation API (.getCurrentPosition(callbackFunction1,callbackFunction2))
    // callbackFunction1 = called on success (with position parameter);
    // callbackFunction2 = called on error (error callback);
    // Checking the received parameter in the console
    //console.log(position);
    // Using destructuring, we can create two new variables with the same name as the position.coords object parameters:
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // Checking the created link on google maps, just to check
    //console.log(`https://www.google.com.br/maps/@${latitude},${longitude}`);

    // Creating a coords variables
    const coords = [latitude, longitude];

    // Adding the map variable according to the leaflet instructions
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    // The 'map' refers to the map ID element from the HTML div
    // the second argument (#mapZoomLevel) on the .setView refers to how far the zoom starts

    // We can change the map STYLE by changing the URL:
    // Option 1: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    // Option 2: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    // Option 3: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'
    // Option 4: 'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png'
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Adding an "event listener" to the map variable created (.on -> Leaflet Library)
    // console.log(map);
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    // We need to assign mapEvent, because it will be used in the other event listener to show the marker, and it must be within the scope
    this.#mapEvent = mapE;
    // First of All, we must show the workout form whenever the map is clicked>
    form.classList.remove('hidden');
    // So that it focus on the first parameter to be filled
    inputDistance.focus();
  }

  _hideForm() {
    // Clearing input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    // Add hidden class back on to the form
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    // We must choose the .closest, because the div is hidden, not the input!
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    // Simple helper function to check if an input is a finite number :
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    // Simple helper function to check if an input is a positive number :
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    // Display marker
    // Whenever we click on the map, the 'mapEvent' will be sent to the function (getting the latitude and longitude)
    // console.log(this.#mapEvent);

    // Preventing reload default
    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; // '+' to convert from string to number
    const duration = +inputDuration.value; // '+' to convert from string to number
    // Getting the info from the click (by destructuring) into variables - lat and lng
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If workout is runnning -> create running object
    if (type === 'running') {
      const cadence = +inputCadence.value; // '+' to convert from string to number
      // Check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert('Inputs have to be positive numbers!');
      }
      // If data validation is OK -> we create a new workout
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout is cycling -> create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value; // '+' to convert from string to number
      // Check if data is valid (elevation might be negative)
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert('Inputs have to be positive numbers!');
      }
      // If data validation is OK -> we create a new workout
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);
    // Checking if it is working
    // console.log(this.#workouts, workout); // It works! 😁

    // Render workout on map as a marker
    this._renderWorkoutMarker(workout);

    // Render new workout on the list
    this._renderWorkout(workout);

    // Hide the form and clear the input fields
    this._hideForm();
  }

  // Creating an auxiliar method to render workout marker
  _renderWorkoutMarker(workout) {
    // When we click, we set a marker to exactly the clicked lat and lng
    // Creating an customizable popup to make it appear whenever the map is clicked -> Following the LEAFLET DOCUMNETATION
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  // Creating an auxiliar method to render workout on the side list
  _renderWorkout(workout) {
    // Creating an HTML (markup) and insert it into the DOM whenever there's a new workout
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;

    if (workout.type === 'running') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    }

    if (workout.type === 'cycling') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🖼️</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    }

    // Insert the html into the DOM whenever there's a new workout (right after the form)
    form.insertAdjacentHTML('afterend', html);
  }

  // Creating a function to move the map the clicked workout
  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout'); //e.target is the element that is actually clicked /.closest('.workout') is the element that I'm looking for with the class '.workout'

    // Just to check the information received when the element is clicked
    // console.log(workoutEl);

    // If we click on 'null', we simply return
    if (!workoutEl) return;

    // We will then find the workout through its id (dataset, because it is data-id)
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    // Checking if it's correct
    // console.log(workout);

    // This is a leaflet method that takes the map to the coordinates (and zoom level, which is mainly 13)
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });

    // Increasing the amount of clicks on the workout (just for demonstration)
    workout.click();
    // console.log(workout);
  }
}

// Creating the objects from the classes
const app = new App();
