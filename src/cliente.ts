/* eslint-disable no-console */
export class Electrodomestico {
  constructor(public descripcion: string, public valor: number) { }

  validarCompra(limiteMaximo: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (limiteMaximo < this.valor) {
        reject('Mmm... no me convence pagar más de $ ' + limiteMaximo + ' por un/a ' + this.descripcion)
      }
      resolve()
    })
  }
}

export class Cliente {
  constructor(public saldo = 5000) {}

  gastar(concepto: string, valor: number): Promise<void> {
    if (this.saldo < valor) {
      return Promise.reject('No puedo gastar ' + valor + ' en ' + concepto + '. Tengo $ ' + this.saldo)
    }
    this.saldo = this.saldo - valor
    return Promise.resolve()
  }

  comprar(cosa: Electrodomestico, limiteMaximo: number): Promise<void> {
    return Promise
      .resolve(cosa.validarCompra(limiteMaximo))
      .then(() => this.gastar(cosa.descripcion, cosa.valor))
  }

  volverEnTaxi(): Promise<void> {
    return Promise.resolve(this.gastar('Taxi', 500))
  }

  procesoDeCompra(cosa: Electrodomestico, valor: number): Promise<void> {
    return Promise
      .resolve()
      // Bien, cada promesa se debe encadenar
      .then(() => this.comprar(cosa, valor))
      .then(() => this.volverEnTaxi())
    // ===============================================
    // TODO: que se vea la diferencia entre () => { } y () => expresión, que devuelva la promise
    // MAL, al ponerla entre llaves la función es () => void, por lo tanto no devuelve la promesa
    // y no se encadena con la siguiente. El error en comprar no se atrapa. El primer test pasa,
    // porque las promesas se ejecutan.
    // .then(() => { this.comprar(cosa, valor) })
    // .then(() => { this.volverEnTaxi() })
    // ================================================
    // otra cosa que puede pasar
    // MAL, no estamos generando la promesa para comprar... por lo tanto no capturamos promesas
    // rechazadas, y se rompe. El primer test pasa
    // .then(() => {
    //   this.comprar(cosa, valor)
    //   return this.volverEnTaxi()
    // })
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