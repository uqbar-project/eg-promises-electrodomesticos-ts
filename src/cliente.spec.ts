import { Cliente, Electrodomestico } from './cliente'

describe('test del cliente', () => {

  let cliente: Cliente

  beforeEach(() => {
    cliente = new Cliente()
  })

  test('Compra exitosa de una heladera barata por debajo del saldo del cliente', () => {
    return cliente.procesoDeCompra(new Electrodomestico('Heladera', 4000), 3800).then(() => {
      expect(cliente.saldo).toBe(700)
    })
  })

  test('Compra exitosa, pero no puede volver en Taxi', () => {
    return cliente.procesoDeCompra(new Electrodomestico('Heladera', 4700), 4600).catch((e) => {
      expect(e.message).toBe('No puedo gastar 500 en Taxi. Tengo $ 400')
      expect(cliente.saldo).toBe(400)
    })
  })

  test('Compra fallida, no me alcanza la plata', () => {
    return cliente.procesoDeCompra(new Electrodomestico('Heladera', 6000), 5100).catch((e) => {
      expect(e.message).toBe('No puedo gastar 5100 en Heladera. Tengo $ 5000')
      expect(cliente.saldo).toBe(5000)
    })
  })

  test('Compra fallida, tengo plata pero para mi consideración la heladera es muy cara', () => {
    return cliente.procesoDeCompra(new Electrodomestico('Heladera', 6000), 6100).catch((e) => {
      expect(e.message).toBe('Mmm... no me convence pagar más de $ 6000 por un/a Heladera')
      expect(cliente.saldo).toBe(5000)
    })
  })

})
