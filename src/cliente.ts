// /* eslint-disable no-console */
export class Electrodomestico {
  constructor(public descripcion: string, public valor: number) { }

  validarCompra(limiteMaximo: number): void {
    if (limiteMaximo < this.valor) {
      throw new Error('Mmm... no me convence pagar más de $ ' + limiteMaximo + ' por un/a ' + this.descripcion)
    }
  }
}

export class Cliente {
  constructor(public saldo = 5000) { }

  gastar(concepto: string, valor: number): void {
    if (this.saldo < valor) {
      throw new Error('No puedo gastar ' + valor + ' en ' + concepto + '. Tengo $ ' + this.saldo)
    }
    this.saldo = this.saldo - valor
  }

  comprar(cosa: Electrodomestico, limiteMaximo: number): void {
    cosa.validarCompra(limiteMaximo)
    this.gastar(cosa.descripcion, cosa.valor)
  }

  volverEnTaxi(): void {
    this.gastar('Taxi', 500)
  }

  procesoDeCompra(cosa: Electrodomestico, limiteMaximo: number): void {
    this.comprar(cosa, limiteMaximo)
    this.volverEnTaxi()
  }
}

// try {
// const cliente = new Cliente(5000)
// OK
// cliente.procesoDeCompra(new Electrodomestico('LCD TV', 4000), 4200)
// No puede volver en Taxi
// cliente.procesoDeCompra(new Electrodomestico('LCD TV', 4700), 4800)
// LCD TV -> no tengo plata
// cliente.procesoDeCompra(new Electrodomestico('LCD TV', 6000), 6200)
// LCD TV -> me la quieren vender muy cara
// cliente.procesoDeCompra(new Electrodomestico('LCD TV', 4000), 2000)
//   console.log('Proceso de compra finalizado. Saldo: ' + cliente.saldo)
// } catch(e) {
//   console.log(e)
// }

// console.info('Cliente queda con saldo de: ', cliente.saldo)
// console.info('Finalizado')