// URL de la api a consumir
const URLAPI = "https://pokeapi.co/api/v2/"
let position = 0 // Saber en que posicion de la lista nos encontramos

$(document).ready(function () {
    // Función que se encarga de crear la lista de los pokemon
    getAllPokemon()
    printLetter()
    printColor()
    printTypes()

    document.addEventListener("keyup", async function (e) {
        // Evento cuando se presiona tecla arriba o abajo
        if (e.key === "ArrowUp" || e.key === "ArrowDown") await changePokemonShow(e)
        // Evento cuando se presiona la tecla c
        if (e.key === "c") showHideShinyPokemon()
        // Evento cuando se presiona la tecla enter
        if (e.key === "Enter") showHideInfo()
        if (e.key === "Backspace") showHideSearch()
    })
})

// Función que se encarga de realizar peticiones a la API
async function performApiQuery(url) {
    try {
        // Se realiza la petición por medio de fetch
        const RESPONSE = await fetch(url);
        // Verficamos que la petición el resultado sea ok
        if (!RESPONSE.ok) {
            throw new Error('Network response was not ok');
        }
        // Convertimos la data en un json
        return await RESPONSE.json();

    } catch (error) {
        console.log('Hubo un problema con la solicitud:', error);
    }
}

// Función que muestra al pokemon en su version shiny
function showHideShinyPokemon() {
    let shiny = document.getElementsByClassName("shiny-sprite")
    let normal = document.getElementsByClassName("normal-sprite")

    // Valida si el shiny contiene la clase hide
    for (let i = 0; i < shiny.length; i++) {
        if (shiny[i].classList.contains("hide")) {
            shiny[i].classList.remove("hide")
            normal[i].classList.add("hide")
        } else {
            shiny[i].classList.add("hide")
            normal[i].classList.remove("hide")
        }
    }
}

// Función para mostrar y ocultar información del pokemon
function showHideInfo() {
    let info = document.getElementById("show-info")
    let search = document.getElementById("show-search")
    info.classList.contains("hide") ? info.classList.remove("hide") : info.classList.add("hide")
    if (!search.classList.contains("hide")) search.classList.add("hide")
}

// Función para mostrar y ocultar busqueda de pokemon
function showHideSearch() {
    let search = document.getElementById("show-search")
    let info = document.getElementById("show-info")
    search.classList.contains("hide") ? search.classList.remove("hide") : search.classList.add("hide")
    if (!info.classList.contains("hide")) info.classList.add("hide")
}

// Función que cambia las secciones de la información del pokemon
function changeSection(section) {
    let sectionsInfo = document.getElementById("sections-info").children

    for (let i = 0; i < sectionsInfo.length; i++) {
        sectionsInfo[i].id == `${section}` ? sectionsInfo[i].classList.remove("hide") : sectionsInfo[i].classList.add("hide")
    }
}

// Funcion para cambiar el pokemon seleccionado
async function changePokemonShow(e) {
    // Obtención datos para realizar scroll y cambiar pokemon seleccionado
    let list = document.getElementById("list").children
    let listScroll = document.getElementById("list")
    let a = e.key == "ArrowDown" ? list.length - 1 : position
    let b = e.key == "ArrowDown" ? position : 0

    if (a > b) {

        position = e.key == "ArrowDown" ? position + 1 : position - 1

        // Obtener nombre y id del pokemon siguiente
        let name = list[position].children[2].value
        let id = list[position].children[2].id

        await getInfoPokemon(name, id)

        // Obtener la posición nueva para el scroll
        let newPosition = list[position].offsetTop - listScroll.offsetTop - 150
        // Aplicar la nueva posición
        listScroll.scrollTo({ top: newPosition, behavior: "smooth" }) // Smooth -> Suave
    }
}

// Función encargada de traer todos los pokemon y agregarlos a la lista
async function getAllPokemon() {
    // Se realiza la petición y se obtiene la data
    const DATA = await performApiQuery(`${URLAPI}pokedex/hoenn`)
    let pokemonList = DATA.pokemon_entries

    await printPokemonList(pokemonList) // Pintar la lista con todos los pokemon

    $("#view").html(pokemonList.length)
    $("#catch").html(pokemonList.length)
}

// Pintar el listado de pokemon
async function printPokemonList(pokemonList) {
    let listPokemon = ``
    let id

    // Recorrer todos los pokemon encontrados
    for (let i = 0; i < pokemonList.length; i++) {

        if (pokemonList[i].pokemon_species.name != "deoxys") {
            // Obtener id del pokemon
            let number = pokemonList[i].entry_number;
            // Si el pokemon es el primero, se le agrega la clase active
            let active = i == 0 ? `active` : ``
            // Si el pokemon es el primero, se obtiene su id
            if (i == 0) id = number
            number = setNumberPokemon(number)

            let name = pokemonList[i].pokemon_species.name

            listPokemon += `
                        <div class="pokemon ${active}" id="${number}">
                            <p><img src="img/logoPagina.png" alt="">No.${number}</p>
                            <p>${name.toUpperCase()}</p>
                            <input type="hidden" id="${number}" value="${name}">
                        </div>
                        `
        }
    }

    $("#list").html(listPokemon)

    // Traer sprite del primer pokemon encontrado
    await getInfoPokemon(pokemonList[0].pokemon_species.name, id)

    let list = document.getElementById("list").children

    // Recorrer todos los pokemon y agregarles un evento cuando se haga click
    for (let i = 0; i < list.length; i++) {
        list[i].addEventListener("click", function () {
            // Obtener nombre y id del pokemon seleccionado
            let name = list[i].children[2].value
            let id = list[i].children[2].id
            // Traer sprite del pokemon seleccionado
            getInfoPokemon(name, id, i)
        })
    }
}

// Función para setear numero del pokemon
function setNumberPokemon(number) {
    // Validar  y agregar los ceros correspondientes
    return (number <= 9) ? "00" + number.toString() : (number <= 99) ? "0" + number.toString() : number
}

// Función que se encarga de traer informacion de un pokemon
async function getInfoPokemon(name, id, newPosition = null) {

    if (newPosition != null) position = newPosition

    // Realizar la peticion y obtener la data
    const DATA = await performApiQuery(`${URLAPI}pokemon/${name}`)

    let image = `
                    <img src="${DATA.sprites.front_default}" alt="${name}" class="normal-sprite">
                    <img src="${DATA.sprites.front_shiny}" alt="${name}" class="hide shiny-sprite">
                `

    $("#pokemon-sprite").html(image)
    $("#sprite-info").html(image)
    $("#evo-sprites").html(image)
    $("#movs-sprite").html(image)
    $("#stats-sprite").html(image)

    let list = document.getElementById("list").children
    // Recorrer todos los pokemon
    for (let i = 0; i < list.length; i++) {
        // Agregar la clase active, si el id del pokemon corresponde, con el pokemon de la pokedex
        list[i].children[2].id == id ? list[i].classList.add("active") : list[i].classList.remove("active")
    }

    let typePokemon = ``
    let abilitiesPokemon = ``
    let heldItemsPokemon = DATA.held_items.length == 0 ? `NOTHING,` : ``

    // Recorremos los tipos que tiene el pokemon
    for (let i = 0; i < DATA.types.length; i++) {
        let type = DATA.types[i].type.name
        typePokemon += `<span class="${type}">${type.toUpperCase()}</span>`
    }

    // Recorremos todas las habilidades que tiene el pokemon
    for (let i = 0; i < DATA.abilities.length; i++) {
        abilitiesPokemon += DATA.abilities[i].ability.name.toUpperCase() + ","
    }

    // Recorremos todos los objetos que puede soltar el pokemon
    for (let i = 0; i < DATA.held_items.length; i++) {
        heldItemsPokemon += DATA.held_items[i].item.name.toUpperCase() + ","
    }

    // Obtenemos la descripcion del pokemon
    getDescriptionPokemon(name)

    let movs = []

    // Recorremos todos los movimientos que puede aprender el pokemon
    for (let i = 0; i < DATA.moves.length; i++) {

        // Obtenemos el detalle del movimiento
        let detailsMov = DATA.moves[i].version_group_details

        for (let j = 0; j < detailsMov.length; j++) {
            // Si el movimiento corresponde a los juegos de esmeralda
            if (detailsMov[j].version_group.name == "emerald")
                // Obtenemos y almacenados la informacion avanzada del movimiento
                movs.push(await getMovePokemon(DATA.moves[i].move.url, detailsMov[j].move_learn_method.name, detailsMov[j].level_learned_at))
        }
    }

    // Pintamos todos los movimientos obtenidos
    printAllMoves(movs)

    // Pintamos todas las stats del pokemon
    printStatsPokemon(DATA.stats)

    name = name.toUpperCase()

    // Obtener id del pokemon seleccionado
    $("#pokemon-view").val(parseInt(id))
    $("#type-pokemon").html(typePokemon)
    $("#weight").html(DATA.weight + "cm")
    $("#height").html(DATA.height + "g")
    $("#abilities").html(abilitiesPokemon.substring(0, abilitiesPokemon.length - 1))
    $("#held-item").html(heldItemsPokemon.substring(0, heldItemsPokemon.length - 1))
    $("#name-evo").html(name)
    $("#name-mov").html(name)
    $("#name-stats").html(name)
}

// Función para obtener descripcion del pokemon y nombre
async function getDescriptionPokemon(name) {
    // Realizamos la peticion y almacenamos la data
    const DATA = await performApiQuery(`${URLAPI}pokemon-species/${name}`)

    // Obtenemos la entradas (descripciones) del pokemon
    let entries = DATA.flavor_text_entries
    let description

    // Recorremos todas las entradas y guardamos la entrada, que sea en ingles y del juego de esmeralda
    for (let i = 0; i < entries.length; i++) {
        if (entries[i].language.name == "en" && entries[i].version.name == "emerald") description = `<p>${entries[i].flavor_text}</p>`
    }

    // Obtenemos todos los numeros en la pokedex del pokemon
    let pokedexNumber = DATA.pokedex_numbers
    let number

    // Si la entrada en la pokedex corresponde a la de esmeralda (hoenn), la obtenemos
    for (let i = 0; i < pokedexNumber.length; i++) {
        if (pokedexNumber[i].pokedex.name == "hoenn") number = pokedexNumber[i].entry_number
    }

    // Seteamos el numero del pokemon
    number = setNumberPokemon(number)
    // Obtenemos la cadena evolutiva del pokemon
    getEvoPokemon(DATA.evolution_chain.url)

    $("#name-pokemon").html(`No.${number} ${name.toUpperCase()}`)
    $("#description").html(description)
}

// Funcion para obtener informacion avanzada de los movimientos que aprenden los pokemon
async function getMovePokemon(url, move_learn_method, level) {
    // Realizamos la peticion y obtenemos la data
    const DATA = await performApiQuery(url)

    return {
        name : DATA.name, // Obtenemos el nombre del movimiento
        category : DATA.damage_class.name, // Obtenemos la categoria a la que pertenece el movimiento
        type : DATA.type.name, // Obtenemos el tipo del movimiento
        move_learn_method : move_learn_method, // Obtenemos el metodo por el cual el pokemon puede aprender el movimiento
        level : level // Obtenemos a que nivel el pokemon puede aprender el movimiento
    }
}

// Funcion que se encarga de clasificar y pintar los movimientos de los pokemon
function printAllMoves(movs) {

    // Ordenar movimientos por nivel
    movs.sort((a, b) => a.level - b.level);

    // Inicializan las variables correspondientes
    let template = `
                        <table>
                            <thead>
                                <tr>
                                    <th>NOMBRE</th>
                                    <th>TIPO</th>
                                    <th>CATEGORIA</th>
                                <tr>
                            </thead>
                            <tbody>
                        `

    let ByLevel = `
                    <p class="type-learn">Por Nivel</p>
                    <table>
                        <thead>
                            <tr>
                                <th>NOMBRE</th>
                                <th>NIVEL</th>
                                <th>TIPO</th>
                                <th>CATEGORIA</th>
                            <tr>
                        </thead>
                        <tbody>
                    `
    let ByTutor = `
                    <p class="type-learn">Por Tutor de Movimiento</p>
                    ${template}
                    `
    let ByEgg = `
                    <p class="type-learn">Por Movimiento Huevo</p>
                    ${template}

                    `
    let ByMachine = `
                    <p class="type-learn">Por MT o MO</p>
                    ${template}
                `
    // Recorremos todos los movimientos y los clasificamos segun su metodo de aprendizaje
    for (let i = 0; i < movs.length; i++) {

        let method = movs[i].move_learn_method
        let typeLevel = method == "level-up" ? `<td>${movs[i].level}</td>` : `` // Si el metodo es por subir de nivel, agregamos el campo nivel

        let template = `
                            <tr>
                                <td>${movs[i].name.toUpperCase()}</td>
                                ${typeLevel}
                                <td><span class="${movs[i].type}">${movs[i].type.toUpperCase()}</span></td>
                                <td><img src="img/${movs[i].category}.gif"></td>
                            </tr>
                            `

        if (method == "level-up") ByLevel += template // Si el pokemon lo aprende subiendo de nivel
        if (method == "tutor") ByTutor += template // Si el pokemon lo aprende por tutor
        if (method == "egg") ByEgg += template // Si el pokemon lo aprende por movimiento huevo
        if (method == "machine") ByMachine += template // Si el pokemon lo aprende por MT o MO
    }

    template = `<tbody></table>`
    ByLevel += template
    ByTutor += template
    ByEgg += template
    ByMachine += template

    let learnMoves = ByLevel + ByTutor + ByEgg + ByMachine + `<i class="fa-solid fa-star" onclick="showHideShinyPokemon()"></i>`
    $("#learn_moves").html(learnMoves)
}

// Funcion que se encarga de traer la cadena evolutiva del pokemon
async function getEvoPokemon(url) {
    // Realizamos la peticion y obtenemos la data
    const DATA = await performApiQuery(url)

    // Obtener todos los pokemon que pertenecen o Hoenn
    let pokemonHoenn = await performApiQuery(`${URLAPI}/pokedex/hoenn`)
    pokemonHoenn = pokemonHoenn.pokemon_entries.map(pokemon => pokemon.pokemon_species.name)

    let name = DATA.chain.species.name
    let nextEvo = DATA.chain.evolves_to

    // Validar si el pokemon existe en la pokedex de hoenn
    if (!pokemonHoenn.includes(name)) {
        name = nextEvo[0].species.name
        nextEvo = nextEvo[0].evolves_to
    }

    // Imprimimos el primero pokemon que aparece en la cadena
    let evolution_chain = `
                            <div class="pokemon-evo">
                                <span class="sprite" id="sprite-${name}"></span>
                                <p>${name.toUpperCase()}</p>
                            </div>
                        `

    let names = []
    let extra = ``
    // Obtenemos el nombre del pokemon
    names.push(name)

    // Recorremos toda la cadena evolutiva del pokemon
    while (nextEvo.length != 0) {
        evolution_chain += `<div class="chain-pokemon">`
        // Recorremos la cadena evolutiva del pokemon
        for (let i = 0; i < nextEvo.length; i++) {
            // Validar que el pokemon exista en la pokedex de hoenn
            if (pokemonHoenn.includes(nextEvo[i].species.name)) {
                let details = nextEvo[i].evolution_details[0]
                let condition = getMethodEvo(details) // Obtenemos el metodo evolutivo del pokemon

                evolution_chain += printChainPokemon(condition, nextEvo[i].species.name) // Imprimimos la cadena evolutiva
                // Obtenemos los nombres de los pokemon
                names.push(nextEvo[i].species.name)
                // Si el pokemon evoluciona a otro pokemon
                if (nextEvo[i].evolves_to != 0) {

                    let moreEvo = nextEvo[i].evolves_to

                    for (let j = 0; j < moreEvo.length; j++) {
                        // Validar que el pokemon exista en la pokedex de hoenn
                        if (pokemonHoenn.includes(moreEvo[j].species.name)) {
                            let detailsExtra = moreEvo[j].evolution_details[0]
                            let conditionExtra = getMethodEvo(detailsExtra) // Obtenemos el metodo evolutivo del pokemon
                            let namePokemon = moreEvo[j].species.name

                            extra += printChainPokemon(conditionExtra, namePokemon) // Imprimimos la cadena evolutiva
                            names.push(namePokemon) // Obtenemos los nombres de los pokemon
                        }
                    }
                }
            }
        }

        evolution_chain += `</div>`
        if (extra != ``) evolution_chain += `<div class="chain-pokemon">${extra}</div>`
        let final = []
        nextEvo = extra != `` ? final : nextEvo[0].evolves_to
    }

    evolution_chain += `<i class="fa-solid fa-star" onclick="showHideShinyPokemon()"></i>`
    $("#evolution_chain").html(evolution_chain)
    // Recorremos todos los nombres de los pokemon para cargar el sprite de cada uno
    for (let i = 0; i < names.length; i++) { getSpritePokemon(names[i]) }
}

// Funcion que obtiene el sprite del pokemon
async function getSpritePokemon(name) {
    // Realizar la peticion y obtener la data
    const DATA = await performApiQuery(`${URLAPI}pokemon/${name}`)

    let img = `
                <img src="${DATA.sprites.front_default}" alt="${name}" class="normal-sprite">
                <img src="${DATA.sprites.front_shiny}" alt="${name}" class="shiny-sprite hide">
            `
    $(`#sprite-${name}`).html(img)
}

// Funcion que pinta la cadena evolutiva del pokemon
function printChainPokemon(condition, name) {
    return `
                <div class="pokemon-chain">
                    <div class="requeriment">
                        <p class="fa-solid fa-right-long"></p>
                        <p>${condition}</p>
                    </div>
                    <div class="pokemon-evo">
                        <span class="sprite" id="sprite-${name}"></span>
                            <p>${name.toUpperCase()}</p>
                        </div>
                    </div>
                `
}

// Funcion para obtener el metodo del pokemon
function getMethodEvo(details) {
    let condition = details.trigger.name == "use-item" ? `` : `${details.trigger.name} `
    // Recorremos todos los posibles metodos de evolucion
    for (let form in details) {
        // Validamos que el metodo de evolucion no sea nulo
        if (details[form] != null) {

            // Realizamos una diferente validacion para algunos metodos evolutivos
            if (form == "needs_overworld_rain" || form == "turn_upside_down" || form == "trigger"
                || form == "min_happiness" || form == "min_beauty" || form == "gender") {

                if (form == "needs_overworld_rain" && details[form]) condition = condition + " rain" // Si el metodo es con lluvia
                if (form == "turn_upside_down" && details[form]) condition = condition + " turn-upside-down" // Si el metodo es volteando hacia abajo
                if (form == "min_happiness") condition = condition + " happiness " // Si el metodo es por felicidad
                if (form == "min_beauty") condition = condition + " beauty " // Si el metodo es por belleza
                if (form == "gender") condition += details[form] == 1 ? ` ♀ ` : ` ♂ `

            } else {
                condition += typeof (details[form]) == "object" ? `${details[form].name} ` : `${details[form]} `
            }
        }
    }

    return condition
}

// Funcion para pintar las estadisticas de un pokemon
function printStatsPokemon(stats) {

    let total = 0
    // Creamos un diccionario, donde tenemos la stat mas alta de cada stat
    let statsMoreUp = {
        "hp": 255,
        "attack": 190,
        "defense": 230,
        "special-attack": 194,
        "special-defense": 230,
        "speed": 200

    }

    for (let i = 0; i < stats.length; i++) { total += stats[i].base_stat } // Obtener la suma total de estadisticas

    // Recorremos todas las stats
    for (let i = 0; i < stats.length; i++) {

        let name = stats[i].stat.name
        let value = stats[i].base_stat
        let percentage = (value * 100) / statsMoreUp[name] // Obtener el porcentaje

        $(`#${name}`).html(value)
        document.getElementById(`${name}-bar`).style.width = `${percentage}%`

        percentage = parseInt(percentage)
        let percentageColor = (percentage < 20) ? "bad" : (percentage >= 20 && percentage < 50) ? "regular" : "good" // Segun el porcentaje, asignamos una clase

        document.getElementById(`${name}-bar`).classList.remove("bad")
        document.getElementById(`${name}-bar`).classList.remove("regular")
        document.getElementById(`${name}-bar`).classList.remove("good")
        document.getElementById(`${name}-bar`).classList.add(percentageColor)
    }

    $("#total").html(total)
}

// Funcion para cambiar la seccion de buscar
function changeSectionSearch(section) {

    let descriptions = {
        "name-search-select": "Buscar por la inicial del nombre de los pokemon.",
        "color-search-select": "Buscar por colores de los pokemon.",
        "type-search-select": "Buscar por los tipos a los que pertenece los pokemon.",
        "order-search-select": "Seleccionar si se quiere ordenar por numero de entrada o nombre pokemon.",
        "type-order-search-select": "Seleccionar si se quiere mostrar de forma ascendente o descendente."
    }

    let sections = document.getElementById("search-info").children

    // Recorrer todas las secciones
    for (let i = 0; i < sections.length; i++) {
        sections[i].id == section ? sections[i].classList.remove("hide") : sections[i].classList.add("hide")
    }

    $("#description-search").html(descriptions[section])
}

// Funcion para imprimir las letras
function printLetter() {
    let letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", 
        "P", "Q", "R", "S", "T", "U", "V", "X", "Y", "Z"]
    let options = `<p class="active" onclick="changeSelection('name-search', 'TODOS')">TODOS</p>`

    for (let l in letters) {
        options += `<p onclick="changeSelection('name-search', '${letters[l]}')">${letters[l]}</p>`
    }

    $("#name-search-select").html(options)
}

// Funcion para imprimir los colores
function printColor() {
    let colors = ["RED", "BLUE", "YELLOW", "GREEN", "BLACK", "BROWN", "PURPLE", "GRAY", "WHITE", "PINK"]
    let options = `<p class="active" onclick="changeSelection('color-search', 'TODOS')">TODOS</p>`

    for (let c in colors) {
        options += `<p onclick="changeSelection('color-search', '${colors[c]}')">${colors[c]}</p>`
    }

    $("#color-search-select").html(options)
}

// Funcion para imprimir los tipos
function printTypes() {
    let types = ["STEEL", "WATER", "BUG", "DRAGON", "ELECTRIC", "GHOST", "FIRE", "FAIRY", "ICE",
        "FIGHTING", "NORMAL", "GRASS", "PSYCHIC", "ROCK", "DARK", "GROUND", "POISON", "FLYING"]
    let options = `<p class="active" onclick="changeSelection('type-search', 'TODOS')">TODOS</p>`

    for (let t in types) {
        options += `<p onclick="changeSelection('type-search', '${types[t]}')">${types[t]}</p>`
    }

    $("#type-search-select").html(options)
}

// Funcion para cambiar el valor de buscar pokemon
function changeSelection(section, value) {

    $(`#${section}`).val(value)
    let options = document.getElementById(`${section}-select`).children

    for (let i = 0; i < options.length; i++) {
        options[i].innerHTML == value ? options[i].classList.add("active") : options[i].classList.remove("active")
    }
}

// Funcion para realizar la busqueda y cerrar el panel de busqueda
async function sendSearch() {
    // Capturar valores
    let letter = document.getElementById("name-search").value
    let type = document.getElementById("type-search").value
    let color = document.getElementById("color-search").value
    let order = document.getElementById("order-search").value
    let typeOrder = document.getElementById("type-order-search").value

    $("#search-result").html("Realizando Busqueda...")
    document.getElementById("search-button").style.cursor = "not-allowed"

    let result = await getPokemonBy(letter, type, color, order, typeOrder) // Realizar busqueda

    if (result.result) {
        showHideSearch()
        $("#search-result").html("")
    } else {
        $("#search-result").html(result.message)
    }

    document.getElementById("search-button").style.cursor = "pointer"
}

// Funcion para buscar pokemon, segun los parametros solicitados
async function getPokemonBy(letter, type, color, order, typeOrder) {
    // Realizar la peticion y obtener la data con todos los pokemon de hoenn
    let listPokemon = await performApiQuery(`${URLAPI}pokedex/hoenn`)
    // Crear un listado donde se almacena el nombre y el numero de la entrada de cada pokemon
    listPokemon = listPokemon.pokemon_entries.map(pokemon => {
        return { pokemon_species: { name: pokemon.pokemon_species.name }, entry_number: pokemon.entry_number }
    })
    let searchListByLetter = []
    let searchListByType = []
    let searchListByColor = []

    // Recorrer todos los pokemon
    for (let pokemon in listPokemon) {

        let name = listPokemon[pokemon].pokemon_species.name

        if (letter != "TODOS") { // Si se busca el pokemon por la primera letra del nombre
            if (name.startsWith(letter.toLowerCase())) searchListByLetter.push(listPokemon[pokemon])
        }

        if (type != "TODOS") { // Si se busca el pokemon por los tipos
            let listPokemonByType = await performApiQuery(`${URLAPI}/type/${type.toLowerCase()}`)
            listPokemonByType = listPokemonByType.pokemon.map(pokemon => pokemon.pokemon.name)

            if (listPokemonByType.includes(name)) searchListByType.push(listPokemon[pokemon])
        }

        if (color != "TODOS") { // Si se busca el pokemon por el color
            let listPokemonByColor = await performApiQuery(`${URLAPI}/pokemon-color/${color.toLowerCase()}`)
            listPokemonByColor = listPokemonByColor.pokemon_species.map(pokemon => pokemon.name)

            if (listPokemonByColor.includes(name)) searchListByColor.push(listPokemon[pokemon])
        }
    }
    if (searchListByLetter.length >= 1) { // Si se obtuvieron registros por letra
        listPokemon = listPokemon.filter(pokemon => searchListByLetter.includes(pokemon)) // Filtrar pokemon
    }

    if (searchListByType.length >= 1) { // Si se obtuvieron registros por tipo
        listPokemon = listPokemon.filter(pokemon => searchListByType.includes(pokemon)) // Filtrar pokemon
    }

    if (searchListByColor.length >= 1) { // Si se obtuvieron registros por tipo
        listPokemon = listPokemon.filter(pokemon => searchListByColor.includes(pokemon)) // Filtrar pokemon
    }

    if (order != null) { // Si se desea ordenar los datos por:
        if (order == "POR NUMERO ENTRADA") { // Por numero de entrada
            typeOrder == "ASCENDENTE" // Ascendente o Descendente
                ? listPokemon.sort((a, b) => a.entry_number - b.entry_number)
                : listPokemon.sort((a, b) => b.entry_number - a.entry_number)
        }

        if (order == "POR NOMBRE") { // Por nombre de pokemon
            typeOrder == "ASCENDENTE" // Ascendente o Descendente
                ? listPokemon.sort((a, b) => a.pokemon_species.name.localeCompare(b.pokemon_species.name))
                : listPokemon.sort((a, b) => b.pokemon_species.name.localeCompare(a.pokemon_species.name))
        }
    }

    // Validar si se encontro algun pokemon con los parametros establecidos
    if (listPokemon.length > 0) {
        await printPokemonList(listPokemon)
        position = 0 // Resetear lista 
        return { result: true, message: "OK" }
    }

    return { result: false, message: "No se encontraron resultados." }
}