var pokemon = [];

const numPerPage = 10;
var numPages = 0;
const numPageBtn = 5;


const setup = async () => {

    // test out poke api using axios here
    let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
    console.log(response.data.results);

    pokemon = response.data.results;
    numPages = Math.ceil(pokemon.length / numPerPage);
    console.log("numPages: " + numPages);

    showPage(1);

    // pop up modal when clicking on a pokemon card
    // add event listener to each pokemon card

    $('body').on('click', '.pokeCard', async function (e) {
        console.log(this);
        const pokemonName = $(this).attr('pokeName')
        console.log("pokemonName: " + pokemonName);
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        console.log("res.data: ", res.data);
        const types = res.data.types.map((type) => type.type.name);
        console.log("types: ", types);

        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
        console.log(res.data.abilities.map((ability) => ability.ability.name).join(''));
        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");

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
        $('.modal-title').html(`<h2>${res.data.name}</h2>`)
    })

    $('body').on('click', '.pageBtn', async function (e) {
        const pageNum = parseInt($(this).attr('pageNum'))
        console.log("=====================pageBtn clicked");
        console.log("pageNum: " + pageNum);
        showPage(pageNum);
    });

    console.log("end of setup");

};

async function showPage(currentPage) {
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

    $('#pokemon').empty();
    for (let i = (currentPage - 1) * numPerPage; i < currentPage * numPerPage; i++) {
        if (i >= pokemon.length) {
            break;
        }
        let innerResponse = await axios.get(pokemon[i].url);
        let thisPokemon = innerResponse.data;
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

    // add pagination buttons
    $('#pagination').empty();
    var startI = Math.max(1, currentPage - Math.floor(numPageBtn / 2));
    var endI = Math.min(numPages, startI + numPageBtn - 1);
    console.log("startI: " + startI);
    console.log("endI: " + endI);
    console.log("numPages: " + numPages);
    console.log("currentPage: " + currentPage);
    console.log("numPageBtn: " + numPageBtn);

    if (currentPage > Math.floor(numPageBtn / 2)) {
        $('#pagination').append(`
            <button type="button" class="btn btn-dark pageBtn" id="page1" pageNum="1">FIRST</button>
            <button type="button" class="btn btn-dark" disabled>...</button>
        `);
    }
    for (let i = startI; i <= endI; i++) {
        $('#pagination').append(`
            <button type="button" class="btn btn-dark pageBtn" id="page${i}" pageNum="${i}">${i}</button>
        `);
    }
    if (currentPage < numPages - Math.floor(numPageBtn / 2)) {
        $('#pagination').append(`
            <button type="button" class="btn btn-dark" disabled>...</button>
            <button type="button" class="btn btn-dark pageBtn" id="page${numPages}" pageNum="${numPages}">LAST</button>
        `);
    }

    $('body').off('click', '.pageBtn');
    $('body').on('click', '.pageBtn', async function (e) {
        const pageNum = parseInt($(this).attr('pageNum'))
        console.log("=====================pageBtn clicked");
        console.log("pageNum: " + pageNum);
        showPage(pageNum);
    });
}


$(document).ready(setup);
