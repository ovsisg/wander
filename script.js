'use strict';

const form = document.querySelector('.form');
const containerPlaces = document.querySelector('.places');
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
  #places = [];
  #markers = [];

  constructor() {
    this._getLocalStorage();
    this._getPosition();

    form.addEventListener('submit', this._newPlace.bind(this));
    inputType.addEventListener('change', this._toggleOptionalFields);
    containerPlaces.addEventListener('click', this._moveToPopup.bind(this));
    containerPlaces.addEventListener('click', this._deletePlace.bind(this));
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

    this.#places.forEach(place => {
      this._renderPlaceMarker(place);
    });
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

    const type = inputType.value;
    const location = inputLocation.value.trim();
    const companion = inputCompanion.value.trim();
    const rating = +inputRating.value;
    const plannedDate = inputPlannedDate.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let place;

    if (!location) return alert('Please enter a location.');

    if (type === 'visited') {
      if (!rating || rating < 1 || rating > 5)
        return alert('Rating must be between 1 and 5.');
      place = new VisitedPlace([lat, lng], location, companion, rating);
    }

    if (type === 'planned') {
      if (!plannedDate) return alert('Please select a planned date.');
      place = new PlannedPlace([lat, lng], location, companion, plannedDate);
    }

    this.#places.push(place);

    this._renderPlaceMarker(place);
    this._renderPlace(place);

    inputLocation.value =
      inputCompanion.value =
      inputRating.value =
      inputPlannedDate.value =
        '';

    form.classList.add('hidden');
    this._setLocalStorage();
  }

  _renderPlaceMarker(place) {
    const marker = L.marker(place.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${place.type}-popup`,
        })
      )
      .setPopupContent(
        `${place.type === 'visited' ? '🌍' : '📍'} ${place.description}`
      )
      .openPopup();

    this.#markers.push({ id: place.id, marker });
  }

  _renderPlace(place) {
    let html = `
      <li class="place place--${place.type}" data-id="${place.id}">
        <div class="place__delete"><span>X</span></div>
        <h2 class="place__title">${place.description}</h2>
        <div class="place__details">
          <span class="place__icon">${
            place.type === 'visited' ? '🌍' : '📍'
          }</span>
          <span class="place__value">${place.location}</span>
        </div>
        <div class="place__details">
          <span class="place__icon">👥</span>
          <span class="place__value">${place.companion}</span>
        </div>
    `;

    if (place.type === 'visited')
      html += `
        <div class="place__details">
          <span class="place__icon">⭐</span>
          <span class="place__value">${place.rating}</span>
        </div>
      </li>
      `;

    if (place.type === 'planned')
      html += `
        <div class="place__details">
          <span class="place__icon">📅</span>
          <span class="place__value">${place.plannedDate}</span>
        </div>
      </li>
      `;

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const placeEl = e.target.closest('.place');
    if (!placeEl) return;

    const place = this.#places.find(pl => pl.id === placeEl.dataset.id);
    if (!place) return;

    this.#map.setView(place.coords, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });
  }

  _deletePlace(e) {
    const deleteBtn = e.target.closest('.place__delete');
    if (!deleteBtn) return;

    const placeEl = deleteBtn.closest('.place');
    const placeId = placeEl.dataset.id;

    this.#places = this.#places.filter(pl => pl.id !== placeId);

    const markerObj = this.#markers.find(m => m.id === placeId);
    if (markerObj) {
      this.#map.removeLayer(markerObj.marker);
      this.#markers = this.#markers.filter(m => m.id !== placeId);
    }

    placeEl.remove();

    this._setLocalStorage();
  }

  _setLocalStorage() {
    localStorage.setItem('places', JSON.stringify(this.#places));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('places'));
    if (!data) return;

    this.#places = data;

    this.#places.forEach(place => {
      this._renderPlace(place);
    });
  }

  reset() {
    localStorage.removeItem('places');
    location.reload();
  }
}

const app = new App();
