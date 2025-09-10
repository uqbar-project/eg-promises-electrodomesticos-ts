function numeroGrande(numero) {
  return new Promise((resolve, reject) => {
    console.log('calculando el valor')
    if (numero > 100) {
      resolve(numero)
    } else {
      reject('El número es chico')
    }
    console.log('Ya lo calculé')
  })
}

console.log('Inicio del programa')
const resultado = 
  numeroGrande(150)
    .then((value) => {
      console.log('value', value)
      return value + 10
    })
    .then((value) => {
      console.log('value', value)
      return 'Ahora sí fin!'
    })
  
// es una promise!  
// console.log(resultado)
console.log('Fin')

// qué pasa si hacemos numeroGrande(50)?
// y si agregamos un .catch después de la llamada?
