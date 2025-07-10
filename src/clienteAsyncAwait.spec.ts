import { beforeEach, describe, expect, test } from 'vitest'
import { Cliente, Electrodomestico } from './clienteAsyncAwait'

describe('test del cliente async/await', () => {

  let cliente: Cliente

  beforeEach(() => {
    cliente = new Cliente()
  })

  test('async / await - Compra exitosa de un LCD TV barata por debajo del saldo del cliente', async () => {
    await cliente.procesoDeCompra(new Electrodomestico('LCD TV', 3800), 4000)
    expect(cliente.saldo).toBe(700)
  })

  test('async / await - Compra exitosa, pero no puede volver en Taxi', async () => {
    await expect(
      cliente.procesoDeCompra(new Electrodomestico('LCD TV', 4600), 4700)
    ).rejects.toThrow('No puedo gastar 500 en Taxi. Tengo $ 400')

    expect(cliente.saldo).toBe(400)
  })

  test('async / await - Compra fallida, no me alcanza la plata', async () => {
    await expect(
      cliente.procesoDeCompra(new Electrodomestico('LCD TV', 5100), 6000)
    ).rejects.toThrow('No puedo gastar 5100 en LCD TV. Tengo $ 5000')
  })

  test('async / await - Compra fallida, tengo plata pero para mi consideración la LCD TV es muy cara', async () => {
    await expect(
      cliente.procesoDeCompra(new Electrodomestico('LCD TV', 6100), 6000)
    ).rejects.toThrow('Mmm... no me convence pagar más de $ 6100 por un/a LCD TV')
    expect(cliente.saldo).toBe(5000)
  })

})