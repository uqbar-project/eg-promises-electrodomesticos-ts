import { readFile } from 'node:fs/promises'

export const VALOR_POR_KM = 25

export type Producto = {
  id: number
  descripcion: string
  precio: number
}

export class Location {
  constructor(
    public longitud: number,
    public latitud: number,
  ) {}
}

export class Electrodomestico {
  constructor(public id: number) {}

  obtenerProducto(): Promise<Producto> {
    const urlDelArchivo = new URL('../productos.json', import.meta.url)
    return readFile(urlDelArchivo, 'utf-8')
      .then((contenidoDelArchivo) => JSON.parse(contenidoDelArchivo) as Producto[])
      .then((productos) => this.buscarProducto(productos, this.id))
  }

  private buscarProducto(productos: Producto[], id: number): Producto {
    const productoBuscado = productos.find((producto) => producto.id === id)
    return productoBuscado ?? lanzarError(`No existe el producto ${id}`)
  }
}

function lanzarError(mensaje: string): never {
  throw new Error(mensaje)
}

export class Cliente {
  ubicacion: Location

  constructor(
    public saldo = 5000,
    public casa: Location,
  ) {
    this.ubicacion = casa
  }

  caminarA(lugar: Location): void {
    this.ubicacion = lugar
  }

  gastar(concepto: string, valor: number): void {
    if (this.saldo < valor) {
      throw new Error(`No puedo gastar ${valor} en ${concepto}. Tengo $ ${this.saldo}`)
    }
    this.saldo = this.saldo - valor
  }

  comprar(cosa: Electrodomestico): Promise<void> {
    return cosa.obtenerProducto().then((productoBuscado) => {
      this.gastar(productoBuscado.descripcion, productoBuscado.precio)
    })
  }

  armarViaje(origen: Location, destino: Location): Promise<number> {
    const urlDelViaje = `https://router.project-osrm.org/route/v1/driving/${origen.longitud},${origen.latitud};${destino.longitud},${destino.latitud}?overview=false`
    return fetch(urlDelViaje)
      .then((respuesta) => respuesta.json())
      .then((datosDelViaje) => datosDelViaje.routes[0].distance)
  }

  volverEnTaxi(): Promise<void> {
    return this.armarViaje(this.ubicacion, this.casa).then((distanciaEnMetros) => {
      this.gastar('Taxi', (distanciaEnMetros / 1000) * VALOR_POR_KM)
    })
  }

  procesoDeCompra(cosa: Electrodomestico): Promise<void> {
    return Promise.resolve()
      .then(() => this.comprar(cosa))
      .then(() => this.volverEnTaxi())
  }
}

// const ubicacionDelNegocio = new Location(-58.5282, -34.5775)
// const casaDelCliente = new Location(-58.3816, -34.6037)
// const cliente = new Cliente(5000, casaDelCliente)
// cliente.caminarA(ubicacionDelNegocio)
// cliente
// .procesoDeCompra(new Electrodomestico(14))
// .then(() => {
//   console.log('Proceso de compra finalizado. Saldo: ' + cliente.saldo)
// })
// .catch((e) => {
//   console.log(e.message)
// })
// .then(() => { console.info('Finalizado')  })
