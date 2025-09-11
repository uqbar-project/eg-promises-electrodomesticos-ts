fetch('https://pokeapi.co/api/v2/ability/?offset=0&limit=20')
  .then((result) => {
    return result.json()
  })
  .then((result) => {
    const filtrados = result.results.filter(pokemon => pokemon.name > 'n')
    console.log('pokemones filtrados', filtrados)
  })