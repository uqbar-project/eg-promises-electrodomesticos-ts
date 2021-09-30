import { Cliente, Electrodomestico } from './clienteSync'

describe('test del cliente', () => {

  let cliente: Cliente

  beforeEach(() => {
    cliente = new Cliente()
  })

  test('promises - Compra exitosa de un LCD TV barata por debajo del saldo del cliente', () => {
    cliente.procesoDeCompra(new Electrodomestico('LCD TV', 4000), 3800)
    expect(cliente.saldo).toBe(700)
  })

  test('promises - Compra exitosa, pero no puede volver en Taxi', () => {
    try {
      cliente.procesoDeCompra(new Electrodomestico('LCD TV', 4700), 4600)
    } catch (e: any) {
      expect(e.message).toBe('No puedo gastar 500 en Taxi. Tengo $ 400')
      expect(cliente.saldo).toBe(400)
    }
  })

  test('promises - Compra fallida, no me alcanza la plata', () => {
    try {
      cliente.procesoDeCompra(new Electrodomestico('LCD TV', 6000), 5100)
    } catch (e: any) {
      expect(e.message).toBe('No puedo gastar 5100 en LCD TV. Tengo $ 5000')
      expect(cliente.saldo).toBe(5000)
    }
  })

  test('promises - Compra fallida, tengo plata pero para mi consideración la LCD TV es muy cara', () => {
    try {
      cliente.procesoDeCompra(new Electrodomestico('LCD TV', 6000), 6100)
    } catch (e: any) { 
      expect(e.message).toBe('Mmm... no me convence pagar más de $ 6000 por un/a LCD TV')
      expect(cliente.saldo).toBe(5000)
    }
  })

})