'use strict';
import { restaurantModal, restaurantRow } from './components.js';
import {fetchData} from './fetchData.js';
import { apiURL } from './variables.js';

const kohde = document.querySelector('tbody');
const modaali = document.querySelector('dialog');
const info = document.querySelector('#info');
const closeModal = document.querySelector('#close-modal');

closeModal.addEventListener('click', () => {
  modaali.close();
});


const teeRavintolaLista = async () => {
  const restaurants = await fetchData(apiURL + '/api/v1/restaurants');

  // your code here

  //aakkosjärjestys
  restaurants.sort((a, b) => a.name.localeCompare(b.name));

  //ravintolat käydään läpi
  restaurants.forEach((restaurant) => {
    if (restaurant) {
      const {_id} = restaurant;

      //ravintola rivin html rivi
      const rivi = restaurantRow(restaurant);

        rivi.addEventListener('click', async () => {
        const korostetut = document.querySelectorAll('.highlight');
        korostetut.forEach ((korostettu) => {
          korostettu.classList.remove('highlight');
        });

        rivi.classList.add('highlight');
        // hae päivän ruokalista
        const paivanLista = await fetchData(
          apiURL + `/api/v1/restaurants/daily/${_id}/fi`
        );

        console.log('päivan lista', paivanLista.courses);
        //tulosta päivän lista
        info.innerHTML = '';
        const ravintolaHTML = restaurantModal(restaurant, paivanLista.courses);
        info.insertAdjacentHTML('beforeend', ravintolaHTML);

        modaali.showModal();
      });

      kohde.append(rivi);
    }
  });
};

teeRavintolaLista();
