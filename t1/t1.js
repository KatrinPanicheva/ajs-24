'use strict';

// Alusta kartta
const map = L.map('map').setView([60.1699, 24.9384], 13); // Aseta alkuperäinen sijainti esim. Helsingin koordinaatteihin

// Lisää OpenStreetMap laatat
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let restaurants = []; // Määritellään tyhjät ravintolat

const showRestaurantsOnMap = () => {
  restaurants.forEach((restaurant) => {
      const lat = restaurant.location.coordinates[1];
      const lng = restaurant.location.coordinates[0];
      const marker = L.marker([lat, lng]).addTo(map);

      // Lisää popup-ikkuna, joka näyttää ravintolan nimen ja osoitteen
      marker.bindPopup(`<b>${restaurant.name}</b><br>${restaurant.address}`).openPopup();
  });
};

const restaurantRow = (restaurant) => {
    const { name, address, company } = restaurant;
    const tr = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.innerText = name;
    const addressCell = document.createElement('td');
    addressCell.innerText = address;
    const companyCell = document.createElement('td');
    companyCell.innerText = company;
    tr.appendChild(nameCell);
    tr.appendChild(addressCell);
    tr.appendChild(companyCell);
    return tr;
};

const restaurantModal = (restaurant, menu) => {
    const { name, address, city, postalCode, phone, company } = restaurant;
    let html = `<h3>${name}</h3>
    <p>${company}</p>
    <p>${address} ${postalCode} ${city}</p>
    <p>${phone}</p>
    <table>
      <tr>
        <th>Course</th>
        <th>Diet</th>
        <th>Price</th>
      </tr>
    `;
    menu.courses.forEach((course) => {
        const { name, diets, price } = course;
        html += `
          <tr>
            <td>${name}</td>
            <td>${diets ?? ' - '}</td>
            <td>${price ?? ' - '}</td>
          </tr>
          `;
    });
    html += '</table>';
    return html;
};

const errorModal = (message) => {
    const html = `
        <h3>Error</h3>
        <p>${message}</p>
        `;
    return html;
};

const fetchData = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Error ${response.status} occurred`);
    }
    const json = await response.json();
    return json;
};

const apiUrl = 'https://media1.edu.metropolia.fi/restaurant/api/v1';
const positionOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};

const modal = document.querySelector('dialog');
if (!modal) {
    throw new Error('Modal not found');
}
modal.addEventListener('click', () => {
    modal.close();
});

const calculateDistance = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

const createTable = () => {
    const table = document.querySelector('table tbody');
    if (!table) {
        console.log('Table is missing in HTML');
        return;
    }
    table.innerHTML = '';
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
          map.removeLayer(layer); // Poista vanhat karttamerkinnät
      }
  });
    // Järjestä ravintolat aakkosjärjestykseen
    restaurants.sort((a, b) => a.name.localeCompare(b.name));

    restaurants.forEach((restaurant) => {
        const tr = restaurantRow(restaurant);
        table.appendChild(tr);

        // Ladataan valikko vasta, kun ravintola klikataan
        tr.addEventListener('click', async () => {
            try {
                modal.innerHTML = '';
                const menu = await fetchData(apiUrl + `/restaurants/daily/${restaurant._id}/fi`);
                const menuHtml = restaurantModal(restaurant, menu);
                modal.insertAdjacentHTML('beforeend', menuHtml);
                modal.showModal();
            } catch (error) {
                modal.innerHTML = errorModal(error.message);
                modal.showModal();
            }
        });
    });

    // Näytetään ravintolat kartalla
    showRestaurantsOnMap();
};

const error = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
};

const success = async (pos) => {
    try {
        const crd = pos.coords;
        restaurants = await fetchData(apiUrl + '/restaurants'); // Ladataan ravintolat ja tallennetaan muuttujaan

        // Järjestä etäisyyden mukaan
        restaurants.sort((a, b) => {
            const x1 = crd.latitude;
            const y1 = crd.longitude;
            const distanceA = calculateDistance(x1, y1, a.location.coordinates[1], a.location.coordinates[0]);
            const distanceB = calculateDistance(x1, y1, b.location.coordinates[1], b.location.coordinates[0]);
            return distanceA - distanceB;
        });

        // Näytetään taulukko ravintoloista (päivän listalla oletuksena)
        createTable();

        // Nappien käsittely
        const dailyBtn = document.querySelector('#daily');
        const weeklyBtn = document.querySelector('#weekly');
        const sodexoBtn = document.querySelector('#sodexo');
        const compassBtn = document.querySelector('#compass');
        const resetBtn = document.querySelector('#reset');

        dailyBtn.addEventListener('click', () => createTable());
        weeklyBtn.addEventListener('click', () => createTable()); // Menu haetaan ravintolan klikkauksen yhteydessä

        sodexoBtn.addEventListener('click', () => {
            const sodexoRestaurants = restaurants.filter((restaurant) => restaurant.company === 'Sodexo');
            createTable(sodexoRestaurants);
        });

        compassBtn.addEventListener('click', () => {
            const compassRestaurants = restaurants.filter((restaurant) => restaurant.company === 'Compass Group');
            createTable(compassRestaurants);
        });

        resetBtn.addEventListener('click', () => createTable());

    } catch (error) {
        modal.innerHTML = errorModal(error.message);
        modal.showModal();
    }
};

navigator.geolocation.getCurrentPosition(success, error, positionOptions);
