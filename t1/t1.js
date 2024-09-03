'use strict';
import { restaurantModal, restaurantRow } from './components.js';
import {fetchData} from './fetchData.js';
import { apiURL } from './variables.js';

const kohde = document.querySelector('tbody');
const modaali = document.querySelector('dialog');
const info = document.querySelector('#info');
const closeModal = document.querySelector('#close-modal');
const sodexoBtn = document.querySelector('#sodexo');
const compassBtn = document.querySelector('#compass');
const resetBtn = document.querySelector('#reset');



//nappi kiinni
closeModal.addEventListener('click', () => {
  modaali.close();
});

//listan tekeminen
const haeRavintolat = async () => {
  return await fetchData(apiURL + '/api/v1/restaurants');
};

const teeRavintolaLista = async (restaurants) => {
  kohde.innerHTML = '';

  //sodexo nappi ja painaus
  sodexoBtn.addEventListener('click', () => {
    const filteredRestaurants = restaurants.filter((restaurant)=>{
      if(restaurant.company === 'Sodexo'){
        return true;
      }
    });
    teeRavintolaLista(filteredRestaurants);
  });

  //compass nappi ja painaus
  compassBtn.addEventListener('click', () => {
    const filteredRestaurants = restaurants.filter((restaurant) =>{
      if(restaurant.company === 'Compass Group'){
        return true;
      }
    });
    teeRavintolaLista(filteredRestaurants)
  });



    //reset nappi
    resetBtn.addEventListener('click', () => {
      const filteredRestaurants = restaurants.filter((restaurant) =>{
        if(restaurant.company === 'reset'){
          return true;
        }
      });
      teeRavintolaLista(filteredRestaurants)
    });




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


const raflat = await haeRavintolat();
teeRavintolaLista(raflat);
