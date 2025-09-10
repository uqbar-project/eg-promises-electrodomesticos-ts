/* eslint-disable no-console */
export class Electrodomestico {
  constructor(public descripcion: string, public valor: number) { }

  validarCompra(limiteMaximo: number): void {
    if (limiteMaximo < this.valor) {
      throw new Error('Mmm... no me convence pagar más de $ ' + limiteMaximo + ' por un/a ' + this.descripcion)
    }
  }
}

export class Cliente {
  constructor(public saldo = 5000) {}

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
//   const cliente = new Cliente()
// OK
// .procesoDeCompra(new Electrodomestico('LCD TV', 4000), 3800)
// No puede volver en Taxi
// .procesoDeCompra(new Electrodomestico('LCD TV', 4700), 4600)
// LCD TV -> no tengo plata
// .procesoDeCompra(new Electrodomestico('LCD TV', 6000), 5100)
// LCD TV -> me la quieren vender muy cara
//   cliente.procesoDeCompra(new Electrodomestico('LCD TV', 6000), 6100)
//   console.log('Proceso de compra finalizado. Saldo: ' + cliente.saldo)
// } catch(e) {
//   console.log(e)
// }