'use strict';

const form = document.querySelector('.form');
const inputType = document.querySelector('.form__input--type');
const inputLocation = document.querySelector('.form__input--location');
const inputCompanion = document.querySelector('.form__input--companion');
const inputRating = document.querySelector('.form__input--rating');
const inputPlannedDate = document.querySelector('.form__input--planned-date');

class Place {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, location, visitType) {
    this.coords = coords;
    this.location = location;
    this.visitType = visitType;
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${
      this.visitType === 'visited' ? 'Visited' : 'Planning to visit'
    } ${this.location} - ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class VisitedPlace extends Place {
  type = 'visited';

  constructor(coords, location, companion, rating) {
    super(coords, location, 'visited');
    this.companion = companion;
    this.rating = rating;
    this._setDescription();
  }
}

class PlannedPlace extends Place {
  type = 'planned';

  constructor(coords, location, companion, plannedDate) {
    super(coords, location, 'planned');
    this.companion = companion;
    this.plannedDate = plannedDate;
    this._setDescription();
  }
}

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
