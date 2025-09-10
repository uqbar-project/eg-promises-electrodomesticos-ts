// /* eslint-disable no-console */
export class Electrodomestico {
  constructor(public descripcion: string, public valor: number) { }

  async validarCompra(limiteMaximo: number): Promise<void> {
    if (limiteMaximo < this.valor) {
      throw new Error('Mmm... no me convence pagar más de $ ' + limiteMaximo + ' por un/a ' + this.descripcion)
    }
  }
}

export class Cliente {
  constructor(public saldo = 5000) {}

  async gastar(concepto: string, valor: number): Promise<void> {
    if (this.saldo < valor) {
      throw new Error('No puedo gastar ' + valor + ' en ' + concepto + '. Tengo $ ' + this.saldo)
    }
    this.saldo = this.saldo - valor
  }

  async comprar(cosa: Electrodomestico, limiteMaximo: number): Promise<void> {
    await cosa.validarCompra(limiteMaximo)
    await this.gastar(cosa.descripcion, cosa.valor)
  }

  async volverEnTaxi(): Promise<void> {
    await this.gastar('Taxi', 500)
  }

  async procesoDeCompra(cosa: Electrodomestico, limiteMaximo: number): Promise<void> {
    await this.comprar(cosa, limiteMaximo)
    await this.volverEnTaxi()
  }
}


// const cliente = new Cliente()
// cliente
// OK
// .procesoDeCompra(new Electrodomestico('LCD TV', 4000), 3800)
// No puede volver en Taxi
// .procesoDeCompra(new Electrodomestico('LCD TV', 4700), 4600)
// LCD TV -> no tengo plata
// .procesoDeCompra(new Electrodomestico('LCD TV', 6000), 5100)
// LCD TV -> me la quieren vender muy cara
// .procesoDeCompra(new Electrodomestico('LCD TV', 6000), 6100)
// .then(() => {
//   console.log('Proceso de compra finalizado. Saldo: ' + cliente.saldo)
// })
// .catch((e) => {
//   console.log(e.message)
// })