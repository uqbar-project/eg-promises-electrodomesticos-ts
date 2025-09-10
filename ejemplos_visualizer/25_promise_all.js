function unCalculo() {
    return Promise.resolve(10)
}

function otroCalculo() {
    return Promise.resolve(20)
}

function ultimoCalculo() {
    return Promise.resolve(30)
}

console.log('Inicio del programa')
const resultado = 
  Promise.all([
    unCalculo(),
    otroCalculo(),
    ultimoCalculo()
  ])
  .then((values) => {
    console.log('values', values)
    return values.reduce((a, b) => a + b, 0)
  })
  .then((suma) => {
    console.log('suma', suma)
    return 'Ahora sí fin!'
  })

// es una promise!  
// console.log(resultado)
console.log('Fin')

// qué pasa si alguna de las promises falla?
// y si agregamos un .catch después de la llamada?