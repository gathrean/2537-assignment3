var pokemon = [];

const numPerPage = 10;
var numPages = 0;
const numPageBtn = 5; // Only show five buttons at the most

const setup = async () => {

    // test out poke api using axios here
    let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
    console.log(response.data.results);

    pokemon = response.data.results;
    numPages = Math.ceil(pokemon.length / numPerPage);
    console.log("numPages: " + numPages);

    $('#pagination').append(`
    <button type="button" class="btn btn-dark" disabled>PREV</button>
  `);

    showPage(1);

    // Adds a click event listener to EACH Pokemon card to show details in a modal
    $('body').on('click', '.pokeCard', async function (e) {

        console.log(this);

        // Pokemon's Name
        const pokemonName = $(this).attr('pokeName')
        console.log("pokemonName: " + pokemonName);

        // Detailed data of clicked Pokemon from the PokeAPI
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        console.log("res.data: ", res.data);

        // Extract the Pokemon's types from the response data
        const types = res.data.types.map((type) => type.type.name);
        console.log("types: ", types);

        // Display detailed information in a modal
        $('.modal-body').html(`
            <div style="width:200px">
            <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${pokemonName}">

                <div>
                    <h3>ABILITIES</h3>
                    <ul> ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}</ul>
                </div>

                <div>
                    <h3>STATS</h3>
                    <ul> ${res.data.stats.map((stat) => `<li>${stat.stat.name}: \t ${stat.base_stat}</li>`).join('')}</ul>
                </div>
                <h3>TYPES</h3>
                <ul> ${types.map((type) => `<li>${type}</li>`).join('')}</ul>
        `)

        // Sets the modal title to the Pokemon's name
        $('.modal-title').html(`<h2>${res.data.name}</h2>`)
    })

    // Adds a click event listenet to page buttons
    $('body').on('click', '.pageBtn', async function (e) {
        const pageNum = parseInt($(this).attr('pageNum'))
        console.log("=====================pageBtn clicked");
        console.log("pageNum: " + pageNum);
        showPage(pageNum);
    });

    console.log("end of setup");

};

// Display a specific page of Pokemon
async function showPage(currentPage) {

    // Makes sure the page number is within valid range
    if (currentPage < 1) {
        currentPage = 1;
    }
    if (currentPage > numPages) {
        currentPage = numPages;
    }
    console.log("showPage: " + currentPage);
    console.log("start: ", ((currentPage - 1) * numPerPage));
    console.log("end: ", ((currentPage - 1) * numPerPage) + numPerPage);
    console.log("pokemon.length: ", pokemon.length);

    // Clear previous Pokemon cards from the dispaly area
    $('#pokemon').empty();

    // Iterate over the Pokemon data for the current page and display their cards
    for (let i = (currentPage - 1) * numPerPage; i < currentPage * numPerPage; i++) {
        if (i >= pokemon.length) {
            break;
        }

        // Retrieve additional details of the Pokemon from the API
        let innerResponse = await axios.get(pokemon[i].url);
        let thisPokemon = innerResponse.data;

        // Create and append the Pokemon card to the display area
        $('#pokemon').append(`
            <div class="pokeCard" pokeName="${thisPokemon.name}">
                <h3>${thisPokemon.name}</h3>
                <img src="${thisPokemon.sprites.front_default}" alt="${thisPokemon.name}">
                <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#pokeModal">
                     INFO
                </button>      
            </div>
        `);
    }

    // Adds Pagination buttons
    $('#pagination').empty();
    var startI = Math.max(1, currentPage - Math.floor(numPageBtn / 2));
    var endI = Math.min(numPages, startI + numPageBtn - 1);

    // Add "FIRST" and "..." buttons if necessary
    if (currentPage > Math.floor(numPageBtn / 2)) {
        $('#pagination').append(`
            <button type="button" class="btn btn-dark pageBtn" id="page1" pageNum="1">FIRST</button>
            <button type="button" class="btn btn-dark" disabled>...</button>
        `);
    }

    // Add "PREV" button
    if (currentPage > 1) {
        $('#pagination').append(`
            <button type="button" class="btn btn-dark pageBtn" id="page${currentPage - 1}" pageNum="${currentPage - 1}">PREV</button>
        `);
    }

    // Add page buttons and highlight current page button
    for (let i = startI; i <= endI; i++) {
        const buttonClass = i === currentPage ? 'btn-success' : 'btn-dark';
        $('#pagination').append(`
            <button type="button" class="btn pageBtn ${buttonClass}" id="page${i}" pageNum="${i}">${i}</button>
        `);
    }

    // Add "NEXT" button
    if (currentPage < numPages) {
        $('#pagination').append(`
            <button type="button" class="btn btn-dark pageBtn" id="page${currentPage + 1}" pageNum="${currentPage + 1}">NEXT</button>
        `);
    }

    // Add "..." and "LAST" buttons if necessary
    if (currentPage < numPages - Math.floor(numPageBtn / 2)) {
        $('#pagination').append(`
            <button type="button" class="btn btn-dark" disabled>...</button>
            <button type="button" class="btn btn-dark pageBtn" id="page${numPages}" pageNum="${numPages}">LAST</button>
        `);
    }

    // Remove any existing click event handlers on page buttons
    $('body').off('click', '.pageBtn');

    // Add a click event handler to page buttons
    $('body').on('click', '.pageBtn', async function (e) {

        // Get the page number from the clicked button
        const pageNum = parseInt($(this).attr('pageNum'));
        console.log("=====================pageBtn clicked");
        console.log("pageNum: " + pageNum);

        // Call the showPage function to display the clicked page
        showPage(pageNum);
    });
}

// Call the setup function when the DOM is ready
$(document).ready(setup);
