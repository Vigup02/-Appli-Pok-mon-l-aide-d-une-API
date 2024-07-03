document.addEventListener('DOMContentLoaded', () => {
    const pokemonList = document.getElementById('pokemon-list');
    const searchInput = document.getElementById('search');
    const typeFilter = document.getElementById('type-filter');
    const themeToggle = document.getElementById('theme-toggle');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const pageNumber = document.getElementById('page-number');

    let currentPage = 1;
    const limit = 20; // Nombre de Pokémon par page
    let totalPokemons = 0; // Nombre total de Pokémon
    let allPokemonData = []; // Pour stocker toutes les données de Pokémon
    let filteredPokemonData = []; // Pour stocker les données filtrées

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(1008 / limit);

    // Récupérer les données de tous les Pokémon et les stocker
    const preloadAllPokemonData = async () => {
        let promises = [];
        for (let i = 1; i <= 1008; i++) {
            promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(res => res.json()));
        }
        allPokemonData = await Promise.all(promises);
        totalPokemons = allPokemonData.length;
        filteredPokemonData = allPokemonData; // Initialement, toutes les données sont non filtrées
        displayPage(currentPage);
    };

    // Afficher la page actuelle des Pokémon
    const displayPage = (page) => {
        pokemonList.innerHTML = ''; // Clear the list before displaying new data
        const start = (page - 1) * limit;
        const end = start + limit;
        const pokemonToDisplay = filteredPokemonData.slice(start, end);
        pokemonToDisplay.forEach(pokemon => displayPokemon(pokemon));
        updatePaginationButtons();
    };

    // Afficher un seul Pokémon avec des informations détaillées
    const displayPokemon = (pokemon) => {
        const pokemonDiv = document.createElement('div');
        pokemonDiv.classList.add('pokemon');
        pokemonDiv.innerHTML = `
            <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
            <h2>${capitalizeFirstLetter(pokemon.name)}</h2>
            <div class= "carte">
                <p>#${pokemon.id.toString().padStart(3, '0')}</p>
                <p>Type : ${pokemon.types.map(typeInfo => capitalizeFirstLetter(typeInfo.type.name)).join(', ')}</p>
                <p>Taille : ${pokemon.height / 10} m</p>
                <p>Poids : ${pokemon.weight / 10} kg</p>
            </div>
            <div class="info_stat">
                <p id="stat"> Statistiques : </p>
                <ul>            
                ${pokemon.stats.map(stat => `
                    <li>${capitalizeFirstLetter(stat.stat.name)}: ${stat.base_stat}
                        <div class="progress-bar">
                            <div class="progress-bar-inner ${stat.stat.name.replace(' ', '-').toLowerCase()}" style="width: ${stat.base_stat}%;"></div>
                        </div>
                    </li>
                `).join('')}
                </ul>
            </div>
        `;
        pokemonList.appendChild(pokemonDiv);
    };

    // Récupérer les types de Pokémon à partir de l'API
    const fetchTypes = async () => {
        const res = await fetch('https://pokeapi.co/api/v2/type');
        const data = await res.json();
        data.results.forEach(type => {
            const option = document.createElement('option');
            option.value = type.name;
            option.textContent = capitalizeFirstLetter(type.name);
            typeFilter.appendChild(option);
        });
    };

    // Mettre en majuscule la première lettre d'une chaîne de caractères
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    // Filtrer les Pokémon en fonction de la recherche et du type de filtre
    const filterPokemon = () => {
        const searchValue = searchInput.value.toLowerCase();
        const typeValue = typeFilter.value.toLowerCase();
        filteredPokemonData = allPokemonData.filter(pokemon => {
            const pokemonName = pokemon.name.toLowerCase();
            const pokemonId = pokemon.id.toString();
            const pokemonTypes = pokemon.types.map(typeInfo => typeInfo.type.name.toLowerCase());
            const pokemonAbilities = pokemon.abilities.map(abilityInfo => abilityInfo.ability.name.toLowerCase());
            const pokemonWeaknesses = []; // Placeholder for weaknesses if you have that data

            const matchesSearch = 
                pokemonName.includes(searchValue) ||
                pokemonId.includes(searchValue) ||
                pokemonTypes.some(type => type.includes(searchValue)) ||
                pokemonAbilities.some(ability => ability.includes(searchValue)) ||
                pokemonWeaknesses.some(weakness => weakness.includes(searchValue));

            const matchesType = typeValue === '' || pokemonTypes.includes(typeValue);
            return matchesSearch && matchesType;
        });
        currentPage = 1; // Reset to first page
        displayPage(currentPage);
    };

    // Update l'état des boutons de pagination
    const updatePaginationButtons = () => {
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === Math.ceil(filteredPokemonData.length / limit);
        pageNumber.textContent = currentPage;
    };

    // Basculer le thème entre le mode clair et le mode foncé
    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');       
    };

    // Event listener for search input
    searchInput.addEventListener('input', filterPokemon);

    // Event listener for type filter
    typeFilter.addEventListener('change', filterPokemon);

    // Event listener for theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Event listeners for pagination buttons
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPage(currentPage);
        }
    });

    // Event listener for next page button
    nextButton.addEventListener('click', () => {
        if (currentPage < Math.ceil(filteredPokemonData.length / limit)) {
            currentPage++;
            displayPage(currentPage);
        }
    });

    // Récupération initiale des Pokémon et des types
    preloadAllPokemonData();
    fetchTypes();
});