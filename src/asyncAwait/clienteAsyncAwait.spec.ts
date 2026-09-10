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
      vi.fn(async () => ({ ok: true, json: async () => ({ routes: [{ distance: distanciaEnMetros }] }) })),
    )
  }

  const mockFetchError = (status: number): void => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status })),
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
    await cliente.procesoDeCompra(electrodomestico, ubicacionDelNegocio)
    expect(cliente.saldo).toBe(500)
  })

  test('async / await - Compra exitosa, pero no puede volver en Taxi', async () => {
    mockFetch(20000)
    const cliente = new Cliente(1400, casaDelCliente)
    await expect(cliente.procesoDeCompra(electrodomestico, ubicacionDelNegocio)).rejects.toThrow(
      'No puedo gastar 500 en Taxi. Tengo $ 400',
    )

    expect(cliente.saldo).toBe(400)
  })

  test('async / await - Compra fallida, no me alcanza la plata', async () => {
    mockFetch(20000)
    const cliente = new Cliente(900, casaDelCliente)
    await expect(cliente.procesoDeCompra(electrodomestico, ubicacionDelNegocio)).rejects.toThrow(
      'No puedo gastar 1000 en LCD TV. Tengo $ 900',
    )

    expect(cliente.saldo).toBe(900)
  })

  test('async / await - Fallo del servicio de rutas (HTTP 400)', async () => {
    mockFetchError(400)
    const cliente = new Cliente(5000, casaDelCliente)
    await expect(cliente.procesoDeCompra(electrodomestico, ubicacionDelNegocio)).rejects.toThrow(
      'Error en la llamada al servicio de rutas',
    )

    expect(cliente.saldo).toBe(4000)
  })
})
