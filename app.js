document.addEventListener('DOMContentLoaded', () => {
    const pokemonList = document.getElementById('pokemon-list');
    const searchInput = document.getElementById('search');
    const typeFilter = document.getElementById('type-filter');
    const themeToggle = document.getElementById('theme-toggle');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const pageNumber = document.getElementById('page-number');

    let currentPage = 1;
    const limit = 100; // Nombre de Pokémon par page
    let totalPokemons = 0; // Nombre total de Pokémon dans l'API (sera récupéré plus tard)

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(1008 / limit); // 1008 est le nombre total de Pokémon dans l'API

    // Récupérer les données Pokémon de l'API avec pagination
    const fetchPokemon = async (page) => {
        pokemonList.innerHTML = ''; // Clear the list before fetching new data
        const offset = (page - 1) * limit;
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
        const data = await res.json();
        totalPokemons = data.count; // Mettre à jour le nombre total de Pokémon
        data.results.forEach(async (pokemon) => {
            const resPokemon = await fetch(pokemon.url);
            const pokemonData = await resPokemon.json();
            displayPokemon(pokemonData);
        });
        updatePaginationButtons();
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

    // Mettre en majuscule la première lettre d'une chaîne de caractères
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    // Filtrer les Pokémon en fonction de la recherche et du type de filtre
    const filterPokemon = () => {
        const searchValue = searchInput.value.toLowerCase();
        const typeValue = typeFilter.value.toLowerCase();
        const pokemonItems = document.querySelectorAll('.pokemon');
        
        pokemonItems.forEach((item) => {
            const pokemonName = item.querySelector('h2').textContent.toLowerCase();
            const pokemonTypes = item.querySelector('p:nth-of-type(2)').textContent.toLowerCase().split(', ');

            const matchesSearch = pokemonName.includes(searchValue);
            const matchesType = typeValue === '' || pokemonTypes.includes(typeValue);

            if (matchesSearch && matchesType) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    };

    // Update l'état des boutons de pagination
    const updatePaginationButtons = () => {
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
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
            fetchPokemon(currentPage);
        }
    });

     // Event listener for next page button
     nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchPokemon(currentPage);
        }
    });

    // Récupération initiale des Pokémon et des types
    fetchPokemon(currentPage);
    fetchTypes();
});