'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Creating the Workout class (Parent class for running and cycling)
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10); // Creating a 'random' id

  constructor(coords, distance, duration) {
    // this.date = ...
    // this.id = ...
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in minutes
  }
}

// Running class -> Child of Workout
class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

// Cycling class -> Child of Workout
class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
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
// Creating the App class (app functionalities)
class App {
  // Private instance properties
  #map;
  #mapEvent;

  constructor() {
    // Starting the application itself as soon as the object is created
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));

    // When we change from running to ciclyng, it should change from cadence to elevation
    // There's no need to .bind, becausen we don't use the this keyword on the toggleElevationField
    inputType.addEventListener('change', this._toggleElevationField);
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
    this.#map = L.map('map').setView(coords, 13);
    // The 'map' refers to the map ID element from the HTML div
    // the second argument (13) on the .setView refers to how far the zoom starts

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

  _toggleElevationField() {
    // We must choose the .closest, because the div is hidden, not the input!
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    // Display marker
    // Whenever we click on the map, the 'mapEvent' will be sent to the function (getting the latitude and longitude)
    // console.log(this.#mapEvent);

    // Preventing reload default
    e.preventDefault();

    // Clearing input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    // Getting the info from the click (by destructuring) into variables - lat and lng
    const { lat, lng } = this.#mapEvent.latlng;

    // When we click, we set a marker to exactly the clicked lat and lng
    // Creating an customizable popup to make it appear whenever the map is clicked -> Following the LEAFLET DOCUMNETATION
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent('Workout')
      .openPopup();
  }
}

// Creating the objects from the classes
const app = new App();
