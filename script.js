'use strict';

const form = document.querySelector('.form');
const inputType = document.querySelector('.form__input--type');
const inputRating = document.querySelector('.form__input--rating');
const inputPlannedDate = document.querySelector('.form__input--planned-date');

class App {
  #map;
  #mapEvent;
  #mapZoomLevel = 13;

  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newPlace.bind(this));
    inputType.addEventListener('change', this._toggleOptionalFields);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Unable to get your location');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
  }

  _toggleOptionalFields() {
    inputPlannedDate
      .closest('.form__row')
      .classList.toggle('form__row--hidden');
    inputRating.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newPlace(e) {
    e.preventDefault();
  }
}

const app = new App();
