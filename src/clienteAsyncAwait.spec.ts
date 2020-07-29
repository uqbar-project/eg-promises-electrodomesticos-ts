import { Cliente, Electrodomestico } from './cliente'

describe('test del cliente async/await', () => {

  let cliente: Cliente

  beforeEach(() => {
    cliente = new Cliente()
  })

  test('async / await - Compra exitosa de un LCD TV barata por debajo del saldo del cliente', async () => {
    await cliente.procesoDeCompra(new Electrodomestico('LCD TV', 4000), 3800)
    expect(cliente.saldo).toBe(700)
  })

  test('async / await - Compra exitosa, pero no puede volver en Taxi', async () => {
    try {
      cliente.procesoDeCompra(new Electrodomestico('LCD TV', 4700), 4600)
    } catch (e) {
      expect(e.message).toBe('No puedo gastar 500 en Taxi. Tengo $ 400')
      expect(cliente.saldo).toBe(400)
    }
  })

  test('async / await - Compra fallida, no me alcanza la plata', async () => {
    try {
      cliente.procesoDeCompra(new Electrodomestico('LCD TV', 6000), 5100)
    } catch (e) {
      expect(e.message).toBe('No puedo gastar 5100 en LCD TV. Tengo $ 5000')
      expect(cliente.saldo).toBe(5000)
    }
  })

  test('async / await - Compra fallida, tengo plata pero para mi consideración la LCD TV es muy cara', () => {
    try {
      cliente.procesoDeCompra(new Electrodomestico('LCD TV', 6000), 6100)
    } catch (e) {
      expect(e.message).toBe('Mmm... no me convence pagar más de $ 6000 por un/a LCD TV')
      expect(cliente.saldo).toBe(5000)
    }
  })

})
