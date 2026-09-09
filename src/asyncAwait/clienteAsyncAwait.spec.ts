import { readFile } from 'node:fs/promises'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { Cliente, Electrodomestico, Location, type Producto } from './clienteAsyncAwait'

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}))

describe('test del cliente async/await', () => {
  const electrodomestico = new Electrodomestico(14)
  const ubicacionDelNegocio = new Location(-58.5282, -34.5775)
  const casaDelCliente = new Location(-58.3816, -34.6037)

  const mockReadFile = (productos: Producto[]): void => {
    vi.mocked(readFile).mockImplementation(async () => JSON.stringify(productos))
  }

  const mockFetch = (distanciaEnMetros: number): void => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ json: async () => ({ routes: [{ distance: distanciaEnMetros }] }) })),
    )
  }

  beforeEach(() => {
    mockReadFile([{ id: 14, descripcion: 'LCD TV', precio: 1000 }])
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  test('async / await - Compra exitosa de un LCD TV barata por debajo del saldo del cliente', async () => {
    mockFetch(20000)
    const cliente = new Cliente(2000, casaDelCliente)
    cliente.caminarA(ubicacionDelNegocio)
    await cliente.procesoDeCompra(electrodomestico)
    expect(cliente.saldo).toBe(500)
  })

  test('async / await - Compra exitosa, pero no puede volver en Taxi', async () => {
    mockFetch(20000)
    const cliente = new Cliente(1400, casaDelCliente)
    cliente.caminarA(ubicacionDelNegocio)
    await expect(cliente.procesoDeCompra(electrodomestico)).rejects.toThrow('No puedo gastar 500 en Taxi. Tengo $ 400')

    expect(cliente.saldo).toBe(400)
  })

  test('async / await - Compra fallida, no me alcanza la plata', async () => {
    mockFetch(20000)
    const cliente = new Cliente(900, casaDelCliente)
    cliente.caminarA(ubicacionDelNegocio)
    await expect(cliente.procesoDeCompra(electrodomestico)).rejects.toThrow(
      'No puedo gastar 1000 en LCD TV. Tengo $ 900',
    )

    expect(cliente.saldo).toBe(900)
  })
})
