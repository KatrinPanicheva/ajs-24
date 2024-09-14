'use strict';
import {restaurantModal, restaurantRow} from './components.js';
import {fetchData} from './fetchData.js';
import {apiURL} from './variables.js';

const kohde = document.querySelector('tbody');
const modaali = document.querySelector('dialog');
const info = document.querySelector('#info');
const closeModal = document.querySelector('#close-modal');
const sodexoBTN = document.querySelector('#sodexo');
const compassBTN = document.querySelector('#compass');
const resetBTN = document.querySelector('#reset');

// kaikki ravintolat tänne
let raflat = [];

closeModal.addEventListener('click', () => {
  modaali.close();
});

const haeRavintolat = async () => {
  return await fetchData(apiURL + '/api/v1/restaurants');
};


const teeRavintolaLista = async (restaurants) => {
  try {
    // testaa globaali raflat
    console.log(raflat);

    kohde.innerHTML = '';
    // filteröinti ************************

    sodexoBTN.addEventListener('click', () => {
      const filteredRestaurants = restaurants.filter(
        (restaurant) => restaurant.company === 'Sodexo'
      );
      teeRavintolaLista(filteredRestaurants);
    });


    compassBTN.addEventListener('click', ()  => {
      const filteredRestaurants = restaurants.filter(
        (restaurant) => restaurant.company === 'Compass Group'
      );
      teeRavintolaLista(filteredRestaurants)
    });



    resetBTN.addEventListener('click', () => {
      teeRavintolaLista(raflat)
    })
    // *************************************

    restaurants.sort((a, b) => a.name.localeCompare(b.name));

    restaurants.forEach((restaurant) => {
      if (restaurant) {
        const {_id} = restaurant;

        // ravintolan HTML rivi
        const rivi = restaurantRow(restaurant);

        rivi.addEventListener('click', async () => {
          try {
            modaali.showModal();
            info.innerHTML = '<div>Ladataa...</div>';

            const korostetut = document.querySelectorAll('.highlight');
            korostetut.forEach((korostettu) => {
              korostettu.classList.remove('highlight');
            });

            rivi.classList.add('highlight');

            // hae päivän ruokalista
            const paivanLista = await fetchData(
              apiURL + `/api/v1/restaurants/daily/${_id}/fi`
            );

            console.log('päivan lista', paivanLista.courses);
            // tulosta päivän ruokalista
            const ravintolaHTML = restaurantModal(
              restaurant,
              paivanLista.courses
            );
            info.innerHTML = '';
            info.insertAdjacentHTML('beforeend', ravintolaHTML);
          } catch (error) {
            console.log(error);
          }
        });

        kohde.append(rivi);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

try {
  raflat = await haeRavintolat();
  teeRavintolaLista(raflat);
} catch (error) {
  console.log(error);
}
