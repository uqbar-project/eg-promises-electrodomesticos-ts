/* eslint-disable no-console */
export class Electrodomestico {
  constructor(public descripcion: string, public valorMaximo: number) { }

  validarCompra(plata: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (plata > this.valorMaximo) {
        reject('Mmm... no me convence pagar más de $ ' + this.valorMaximo + ' por un/a ' + this.descripcion)
      }
      resolve()
    })
  }
}

export class Cliente {
  saldo = 5000

  gastar(concepto: string, valor: number): Promise<void> {
    if (this.saldo < valor) {
      return Promise.reject('No puedo gastar ' + valor + ' en ' + concepto + '. Tengo $ ' + this.saldo)
    }
    this.saldo = this.saldo - valor
    return Promise.resolve()
  }

  comprar(cosa: Electrodomestico, valor: number): Promise<void> {
    return Promise
      .resolve(cosa.validarCompra(valor))
      .then(() => this.gastar(cosa.descripcion, valor))
  }

  volverEnTaxi(): Promise<void> {
    return Promise.resolve(this.gastar('Taxi', 500))
  }

  procesoDeCompra(cosa: Electrodomestico, valor: number): Promise<void> {
    return Promise
      .resolve()
      .then(() => this.comprar(cosa, valor))
      .then(() => this.volverEnTaxi())
  }
}

const cliente = new Cliente()
cliente
  // OK
  // .procesoDeCompra(new Electrodomestico('LCD TV', 4000), 3800)
  // No puede volver en Taxi
  // .procesoDeCompra(new Electrodomestico('LCD TV', 4700), 4600)
  // LCD TV -> no tengo plata
  // .procesoDeCompra(new Electrodomestico('LCD TV', 6000), 5100)
  // LCD TV -> me la quieren vender muy cara
  .procesoDeCompra(new Electrodomestico('LCD TV', 6000), 6100)
  .then(() => {
    console.log('Proceso de compra finalizado. Saldo: ' + cliente.saldo)
  })
  .catch((e) => {
    console.log(e.message)
  })