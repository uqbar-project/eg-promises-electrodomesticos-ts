let saldo = 5000

function comprar() {
  saldo = saldo - 1000
  console.log('saldo actualizado', saldo)
}

function main() {
  Promise.resolve()
    .then(() => comprar())
  console.log('saldo', saldo)
}

main()