import { readFile } from 'node:fs/promises'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { Cliente, Electrodomestico, Location, type Producto } from './clientePromises'

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}))

describe('test del cliente', () => {
  const electrodomestico = new Electrodomestico(14)
  const ubicacionDelNegocio = new Location(-58.5282, -34.5775)
  const casaDelCliente = new Location(-58.3816, -34.6037)

  const mockReadFile = (productos: Producto[]): void => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(productos))
  }

  const mockFetch = (distanciaEnMetros: number): void => {
    const respuestaOSRM = { json: () => Promise.resolve({ routes: [{ distance: distanciaEnMetros }] }) }
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(respuestaOSRM)),
    )
  }

  beforeEach(() => {
    mockReadFile([{ id: 14, descripcion: 'LCD TV', precio: 1000 }])
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  test('promises - Compra exitosa de un LCD TV barata por debajo del saldo del cliente', () => {
    mockFetch(20000)
    const cliente = new Cliente(2000, casaDelCliente)
    cliente.caminarA(ubicacionDelNegocio)
    return cliente.procesoDeCompra(electrodomestico).then(() => {
      expect(cliente.saldo).toBe(500)
    })
  })

  test('promises - Compra exitosa, pero no puede volver en Taxi', () => {
    mockFetch(20000)
    const cliente = new Cliente(1400, casaDelCliente)
    cliente.caminarA(ubicacionDelNegocio)
    return expect(cliente.procesoDeCompra(electrodomestico))
      .rejects.toThrow('No puedo gastar 500 en Taxi. Tengo $ 400')
      .then(() => expect(cliente.saldo).toBe(400))
  })

  test('promises - Compra fallida, no me alcanza la plata', () => {
    mockFetch(20000)
    const cliente = new Cliente(900, casaDelCliente)
    cliente.caminarA(ubicacionDelNegocio)
    return expect(cliente.procesoDeCompra(electrodomestico))
      .rejects.toThrow('No puedo gastar 1000 en LCD TV. Tengo $ 900')
      .then(() => expect(cliente.saldo).toBe(900))
  })
})
