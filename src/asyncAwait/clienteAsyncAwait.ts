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

  async obtenerProducto(): Promise<Producto> {
    const urlDelArchivo = new URL('../productos.json', import.meta.url)
    const contenidoDelArchivo = await readFile(urlDelArchivo, 'utf-8')
    const productos = JSON.parse(contenidoDelArchivo) as Producto[]
    return this.buscarProducto(productos, this.id)
  }

  private buscarProducto(productos: Producto[], id: number): Producto {
    const productoBuscado = productos.find((producto) => producto.id === id)
    return productoBuscado ?? lanzarError(`No existe el producto ${id}`)
  }
}

// lanzarError solo es un método para poder usar el syntactic sugar en productoBuscado ?? lanzarError(...)
// Si queremos hacer productoBuscado ?? throw ... Typescript sabe que throw nunca devuelve una expresión, por lo tanto el compilador falla
// Si lanzarError quiere tiparse que devuelve void, eso produce error en buscarProducto
// Entonces lo tipamos que devuelve never => valores que nunca pueden existir (en una función que solo lanza un error, o
// en referencias a tipos como string & number)
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

  async comprar(cosa: Electrodomestico): Promise<void> {
    const productoBuscado = await cosa.obtenerProducto()
    this.gastar(productoBuscado.descripcion, productoBuscado.precio)
  }

  async armarViaje(origen: Location, destino: Location): Promise<number> {
    const urlDelViaje = `https://router.project-osrm.org/route/v1/driving/${origen.longitud},${origen.latitud};${destino.longitud},${destino.latitud}?overview=false`
    const respuesta = await fetch(urlDelViaje)
    if (!respuesta.ok) {
      throw new Error('Error en la llamada al servicio de rutas')
    }
    const datosDelViaje = await respuesta.json()
    return datosDelViaje.routes[0].distance
  }

  async volverEnTaxi(): Promise<void> {
    const distanciaEnMetros = await this.armarViaje(this.ubicacion, this.casa)
    await this.gastar('Taxi', (distanciaEnMetros / 1000) * VALOR_POR_KM)
  }

  async procesoDeCompra(cosa: Electrodomestico, negocio: Location): Promise<void> {
    this.caminarA(negocio)
    await this.comprar(cosa)
    await this.volverEnTaxi()
  }
}

// const ubicacionDelNegocio = new Location(-58.5282, -34.5775)
// const casaDelCliente = new Location(-58.3816, -34.6037)
// const cliente = new Cliente(5000, casaDelCliente)
// cliente
// .procesoDeCompra(new Electrodomestico(14), ubicacionDelNegocio)
// .then(() => {
//   console.log('Proceso de compra finalizado. Saldo: ' + cliente.saldo)
// })
// .catch((e) => {
//   console.log(e.message)
// })
