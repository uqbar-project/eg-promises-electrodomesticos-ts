import { describe, expect, test } from 'vitest'
import { Cliente, Electrodomestico } from './clienteSync'

describe('test del cliente', () => {

  const electrodomestico = new Electrodomestico('LCD TV', 1000)

  test('promises - Compra exitosa de un LCD TV barata por debajo del saldo del cliente', () => {
    const cliente = new Cliente(2000)
    cliente.procesoDeCompra(electrodomestico, 1200)
    expect(cliente.saldo).toBe(500)
  })

  test('promises - Compra exitosa, pero no puede volver en Taxi', () => {
    const cliente = new Cliente(1400)
    try {
      cliente.procesoDeCompra(electrodomestico, 1200)
    } catch (error: unknown) {
      expect((error as Error).message).toBe('No puedo gastar 500 en Taxi. Tengo $ 400')
      expect(cliente.saldo).toBe(400)
    }
  })

  test('promises - Compra fallida, no me alcanza la plata', () => {
    const cliente = new Cliente(900)
    try {
      cliente.procesoDeCompra(electrodomestico, 1200)
    } catch (error: unknown) {
      expect((error as Error).message).toBe('No puedo gastar 1000 en LCD TV. Tengo $ 900')
      expect(cliente.saldo).toBe(900)
    }
  })

  test('promises - Compra fallida, tengo plata pero para mi consideración la LCD TV es muy cara', () => {
    const cliente = new Cliente(2000)
    try {
      cliente.procesoDeCompra(electrodomestico, 800)
    } catch (error: unknown) { 
      expect((error as Error).message).toBe('Mmm... no me convence pagar más de $ 800 por un/a LCD TV')
      expect(cliente.saldo).toBe(2000)
    }
  })

})