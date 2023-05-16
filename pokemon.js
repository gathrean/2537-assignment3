// Constants
const PAGE_SIZE = 10; // Number of iterms per page
let currentPage = 1;
let pokemons = [];

// Sets up initial state
const setup = async () => {
  // Clear the Pokemon cards contianer
  $('#pokeCards').empty();

  // Fetch Pokemon data from the PokeAPI
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  // Fetch Pokemon types and add event listeners
  await fetchPokemonTypes();

  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    const types = res.data.types.map((type) => type.type.name)

    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to type checkboxes
  $('body').on('change', '.typeCheckbox', async function () {
    const selectedTypes = [];
    $('.typeCheckbox:checked').each(function () {
      selectedTypes.push($(this).val());
    });

    await filterPokemons(selectedTypes);
  });

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons, .previousButton, .nextButton", async function (e) {
    currentPage = Number(e.target.value);
    const selectedTypes = [];
    $('.typeCheckbox:checked').each(function () {
      selectedTypes.push($(this).val());
    });

    await filterPokemons(selectedTypes);
  });

  $('body').on('click', '.firstButton', async function () {
    currentPage = 1;
    const selectedTypes = [];
    $('.typeCheckbox:checked').each(function () {
      selectedTypes.push($(this).val());
    });

    await filterPokemons(selectedTypes);
  });

  $('body').on('click', '.lastButton', async function () {
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
    currentPage = numPages;
    const selectedTypes = [];
    $('.typeCheckbox:checked').each(function () {
      selectedTypes.push($(this).val());
    });

    await filterPokemons(selectedTypes);
  });


  const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  paginate(currentPage, PAGE_SIZE, pokemons);
  updatePaginationDiv(currentPage, numPages);
};

const updatePaginationDiv = (currentPage, numPages) => {
  $('.pagination').empty();

  if (currentPage > 1) {
    $('.pagination').append(`
          <li class="page-item">
              <button class="btn btn-dark page-link firstButton" value="1">FIRST</button>
          </li>
          <li class="page-item">
              <button class="btn btn-dark page-link previousButton" value="${currentPage - 1}">PREV</button>
          </li>
      `);
  }

  const startPage = currentPage === 1 ? 1 : Math.max(1, currentPage - 2);
  const endPage = Math.min(numPages, startPage + 4);

  for (let i = startPage; i <= endPage; i++) {
    $('.pagination').append(`
          <li class="page-item${i === currentPage ? ' active' : ''}">
              <button class="btn btn-dark page-link numberedButtons" value="${i}">${i}</button>
          </li>
      `);
  }

  if (currentPage < numPages) {
    $('.pagination').append(`
          <li class="page-item">
              <button class="btn btn-dark page-link nextButton" value="${currentPage + 1}">NEXT</button>
          </li>
          <li class="page-item">
              <button class="btn btn-dark page-link lastButton" value="${numPages}">LAST</button>
          </li>
      `);
  }
};


const updateDisplayInfo = (total, displayed) => {
  $('#displayInfo').text(`Total Pokémon: ${total} | Displayed Pokémon: ${displayed}`);
};

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  $('#pokeCards').empty();
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url);
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}>
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
                <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#pokeModal">
                     INFO
                </button>   
      </div>
    `);
  });

  updateDisplayInfo(pokemons.length, selected_pokemons.length);
}



const fetchPokemonTypes = async () => {
  const response = await axios.get('https://pokeapi.co/api/v2/type');
  const types = response.data.results;

  const typesCheckboxes = types.map((type) => `
      <div class="form-check form-check-inline">
        <input class="form-check-input typeCheckbox" type="checkbox" value="${type.name}" id="${type.name}">
        <label class="form-check-label" for="${type.name}">${type.name}</label>
      </div>
    `).join('');

  $('#pokemonTypes').html(typesCheckboxes);
};

const pokemonTypeCache = new Map();

const fetchPokemonDetails = async (pokemon) => {
  if (pokemonTypeCache.has(pokemon.name)) {
    return pokemonTypeCache.get(pokemon.name);
  }

  try {
    const res = await axios.get(pokemon.url);
    const types = res.data.types.map((type) => type.type.name);
    pokemonTypeCache.set(pokemon.name, types);
    return types;
  } catch (error) {
    console.error('error where r the pokemon details', error);
    return [];
  }
};


const filterPokemons = async (selectedTypes) => {
  const filteredPokemons = [];

  for (const pokemon of pokemons) {
    const types = await fetchPokemonDetails(pokemon);
    if (selectedTypes.length === 0 || selectedTypes.every((type) => types.includes(type))) {
      filteredPokemons.push(pokemon);
    }
  }

  paginate(currentPage, PAGE_SIZE, filteredPokemons);
  const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);
};

$(document).ready(setup);