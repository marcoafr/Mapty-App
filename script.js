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

// Implementing Geolocation API (.getCurrentPosition(callbackFunction1,callbackFunction2))
// callbackFunction1 = called on success (with position parameter);
// callbackFunction2 = called on error (error callback);
// We should first test if the navigator.geolocation API exists (old browsers don't support them)
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
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
      const map = L.map('map').setView(coords, 13);
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
      }).addTo(map);

      // Adding an "event listener" to the map variable created (.on -> Leaflet Library)
      // console.log(map);
      map.on('click', function (mapEvent) {
        // Whenever we click on the map, the 'mapEvent' will be sent to the function (getting the latitude and longitude)
        // console.log(mapEvent);

        // Getting the info from the click (by destructuring) into variables - lat and lng
        const { lat, lng } = mapEvent.latlng;

        // When we click, we set a marker to exactly the clicked lat and lng
        // Creating an customizable popup to make it appear whenever the map is clicked -> Following the LEAFLET DOCUMNETATION
        L.marker([lat, lng])
          .addTo(map)
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
      });
    },
    function () {
      alert("Could not get user's position! 🚫");
    }
  );
}
