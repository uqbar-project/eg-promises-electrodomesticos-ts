// Ejemplos para el Visualizer 9000
// https://www.jsv9000.app/
let saldo = 5000

function comprar(cosa) {
  console.log('comprar')
  saldo = saldo - cosa.valor()
}

function irEnTaxi() {
  console.log('irEnTaxi')
  saldo = saldo - 500
}

function main() {
  const heladera = { valor() { return 2000 } }
  Promise.resolve()
    .then(() => comprar(heladera))
    .then(() => irEnTaxi())
    .then(() => console.log(saldo))
  console.log('arranca...')
}

main()
