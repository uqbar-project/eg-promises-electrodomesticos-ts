import { describe, expect, test } from 'vitest'
import { Cliente, Electrodomestico } from './clienteAsyncAwait'

describe('test del cliente async/await', () => {

  const electrodomestico = new Electrodomestico('LCD TV', 1000)

  test('async / await - Compra exitosa de un LCD TV barata por debajo del saldo del cliente', async () => {
    const cliente = new Cliente(2000)
    await cliente.procesoDeCompra(electrodomestico, 1200)
    expect(cliente.saldo).toBe(500)
  })

  test('async / await - Compra exitosa, pero no puede volver en Taxi', async () => {
    const cliente = new Cliente(1400)
    await expect(
      cliente.procesoDeCompra(electrodomestico, 1200)
    ).rejects.toThrow('No puedo gastar 500 en Taxi. Tengo $ 400')

    expect(cliente.saldo).toBe(400)
  })

  test('async / await - Compra fallida, no me alcanza la plata', async () => {
    const cliente = new Cliente(900)
    await expect( 
      cliente.procesoDeCompra(electrodomestico, 1200)
    ).rejects.toThrow('No puedo gastar 1000 en LCD TV. Tengo $ 900')
  })

  test('async / await - Compra fallida, tengo plata pero para mi consideración la LCD TV es muy cara', async () => {
    const cliente = new Cliente(2000)
    await expect(
      cliente.procesoDeCompra(electrodomestico, 800)
    ).rejects.toThrow('Mmm... no me convence pagar más de $ 800 por un/a LCD TV')
    expect(cliente.saldo).toBe(2000)
  })

})