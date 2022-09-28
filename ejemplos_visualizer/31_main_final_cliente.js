// Ejemplos para el Visualizer 9000
// https://www.jsv9000.app/
class Cliente {
  constructor() {
    this.saldo = 5000
  }
  
  bajarSaldo(valor) { this.saldo = this.saldo - valor }
}

function comprar(cliente, cosa) {
  console.log('comprar')
  cliente.bajarSaldo(cosa.valor())
  return cliente
}

function irEnTaxi(cliente) {
  console.log('irEnTaxi')
  cliente.bajarSaldo(500)
  return cliente
}

function main() {
  const heladera = { valor() { return 2000 } }
  Promise.resolve(new Cliente())
    .then((cliente) => comprar(cliente, heladera))
    .then((cliente) => irEnTaxi(cliente))
    .then((cliente) => console.log(cliente.saldo))
  console.log('arranca...')
}

main()
