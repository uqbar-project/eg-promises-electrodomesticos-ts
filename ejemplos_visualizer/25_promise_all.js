function unCalculo() { return Promise.resolve(10) }
function otroCalculo() { return Promise.reject(new Error('Tralalero tralala')) }
function ultimoCalculo() { return Promise.resolve(30) }

(async () => {
  try {
    console.log('Inicio del programa')
    const values = await
      Promise.all([
        unCalculo(),
        otroCalculo(),
        ultimoCalculo()
      ])
    console.log('values', values)
    const suma = values.reduce((a, b) => a + b, 0)
    console.log('suma', suma)
    console.log('Fin')
  } catch (error) {
    console.error('No se puede sumar: ', error.message)
  }
})()

// qué pasa si alguna de las promises falla?
// y si agregamos un .catch después de la llamada?