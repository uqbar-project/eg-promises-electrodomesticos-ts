import { beforeEach, describe, expect, test } from 'vitest'
import { Cliente, Electrodomestico } from './cliente'

describe('test del cliente', () => {

  const electrodomestico = new Electrodomestico('LCD TV', 3800)

  test('promises - Compra exitosa de un LCD TV barata por debajo del saldo del cliente', () => {
    const cliente = new Cliente(5000)
    return cliente.procesoDeCompra(electrodomestico, 4000)
      .then(() => {
        expect(cliente.saldo).toBe(700)
      })
  })

  test('promises - Compra exitosa, pero no puede volver en Taxi', () => {
    const cliente = new Cliente(4200)
    return cliente.procesoDeCompra(electrodomestico, 3900)
      .then(() => { throw new Error('No debería haber comprado') })
      .catch((message) => {
        expect(message).toBe('No puedo gastar 500 en Taxi. Tengo $ 400')
        expect(cliente.saldo).toBe(400)
      })
  })

  test('promises - Compra fallida, no me alcanza la plata', () => {
    const cliente = new Cliente(3000)
    return cliente.procesoDeCompra(electrodomestico, 3900)
      .then(() => { throw new Error('No debería haber comprado') })
      .catch((message) => {
        expect(message).toBe('No puedo gastar 3800 en LCD TV. Tengo $ 3000')
        expect(cliente.saldo).toBe(3000)
      })
  })

  test('promises - Compra fallida, tengo plata pero para mi consideración la LCD TV es muy cara', () => {
    const cliente = new Cliente(5000)
    return cliente.procesoDeCompra(electrodomestico, 3000)
      .then(() => { throw new Error('No debería haber comprado') })
      .catch((message) => {
        expect(message).toBe('Mmm... no me convence pagar más de $ 3000 por un/a LCD TV')
        expect(cliente.saldo).toBe(5000)
      })
  })

})