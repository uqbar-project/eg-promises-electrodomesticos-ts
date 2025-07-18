
# Ejemplo introductorio Promises

[![build](https://github.com/uqbar-project/eg-promises-electrodomesticos-ts/actions/workflows/build.yml/badge.svg)](https://github.com/uqbar-project/eg-promises-electrodomesticos-ts/actions/workflows/build.yml) [![codecov](https://codecov.io/gh/uqbar-project/eg-promises-electrodomesticos-ts/graph/badge.svg?token=WYVGPG3UPN)](https://codecov.io/gh/uqbar-project/eg-promises-electrodomesticos-ts)

## Introducción

Supongamos la siguiente situación:

![circuito](./images/circuito.png)

Queremos ir a comprar un electrodoméstico. Un televisor para ser más precisos. El circuito completo sería:

- Vamos caminando al negocio.
- Si el LCD está "en precio", lo compramos.
- Nos volvemos en taxi con el televisor, sabemos que nos cobran $ 500.

### Restricciones

Algunas restricciones que podemos tener:

- que el televisor no esté en precio: tenemos que definir cuál es el precio máximo que estamos dispuestos a pagar.
- que no tengamos suficiente dinero para pagar el televisor.
- que no tengamos suficiente dinero para pagar el taxi.

## Primera implementación

Podríamos pensar en una clase cliente que tenga la siguiente lógica

```ts
class Cliente {
  saldo: number = 5000

  procesoDeCompra(cosa: Electrodomestico, valor: number) {
    // ir caminando no tiene efecto en nuestro código
    // chequeo si el electrodoméstico está en precio
    cosa.validarCompra(valor) 
    // valido que tenga suficiente compra y bajo el saldo
    this.gastar(cosa.descripcion, valor)
    // similar a this.gastar('Taxi', 500)
    this.volverEnTaxi()
  }
}
```

En esta solución **todo ocurre casi inmediatamente**. Y en realidad, cada proceso puede demorar un tiempo: la decisión de la compra, e incluso el tomar el taxi.

## Sincrónico vs. asincrónico

Nuestra solución así planteada es **sincrónica**:

- la instrucción siguiente ocurre inmediatamente después de que se ejecutó la instrucción anterior
- si una instrucción devuelve un valor, puede ser referenciado por una variable, por ejemplo:

```ts
const totalGastado = this.gastar(cosa.descripcion, valor)
```

- el método `procesoDeCompra` se ejecuta sincrónicamente, esto implica que en ningún momento otro proceso puede utilizar la VM. Esto lo hacemos porque sabemos que todas las operaciones no consumen recursos, ni demoran más del tiempo "razonable". No obstante, tenemos muchos casos donde estas situaciones no se pueden garantizar, porque salimos del cómodo entorno de nuestra máquina virtual: operaciones de I/O, acceso a recursos compartidos y concurrencia nos pueden jugar una mala pasada.

Para comenzar a acostumbrarnos a la modalidad asincrónica, veamos el mismo método en formato asincrónico. El método `procesoDeCompra` se va a transformar en una **corrutina** o **función pausable**. Para ello, vamos a separar ese proceso en dos grandes pasos:

- comprar el electrodoméstico
- volver en taxi

Antes de continuar, necesitamos conocer las promises.

## Promises

Una promise es un objeto de Javascript que representa una ejecución asincrónica de un proceso. Cuando creamos una _promise_ su estado es `<pending>`, y luego puede resolverse exitosamente (`<fulfilled>`) o fallar (`<rejected>`).

Podemos ejecutar en la consola del navegador este código:

```js
const numeroGrande = (numero) => new Promise((resolve, reject) => {
  if (numero > 100) {
    resolve(numero)
  } else {
    reject('El número es chico')
  }
})
```

`numeroGrande` es una función que recibe un número y no se ejecuta directamente, sino que "se pausa" y espera su próximo turno. Cuando le toca, 

- si el número es > 100 (es grande), entonces ejecutará la porción de código exitosa, que es la referencia `resolve`
- si el número no es mayor a 100, entonces la promesa se rechaza con un mensaje de error: "El número es chico"

Lo evaluamos en la consola:

```js
numeroGrande(5)
Promise {<rejected>: 'El número es chico'}
```

¿Qué devuelve la función `numeroGrande(5)`? una **promesa rechazada**, indicando que el número es chico. Si en cambio evaluamos la función con un número más grande:

```js
numeroGrande(550)
Promise {<resolved>: 550}
```

La promesa se resuelve exitosamente y devuelve como valor el número que le pasamos. Este valor lo podemos recuperar y utilizarlo, mediante el método `then`, de la siguiente manera:

```js
numeroGrande(550)
  .then((valor) => valor + 100)
Promise {<resolved>: 650}
```

Aquí vemos que el `then` **genera una nueva promesa**, con el valor correspondiente: 550 + 100. ¿Pero qué pasa si queremos pasarle un número no tan grande?

```js
numeroGrande(50).then((valor) => valor + 100)
Promise {<rejected>: 'El número es chico'}
```

La consola nos tira un error indicando que el número es chico. Podemos atrapar ese error mediante la expresión `catch`:

```js
numeroGrande(50)
  .then((valor) => valor + 100)
  .catch((message) => { throw message } )
Promise {<rejected>: 'El número es chico'}
```

Bueno, no notamos mucha diferencia, pero podríamos mejorar nuestra definición original de la función `numeroGrande`:

```js
const numeroGrande = (numero) => new Promise((resolve, reject) => {
  if (numero > 100) {
    resolve(numero)
  } else {
    reject(100 - numero)
  }
})
```

Lo que devuelve ahora es lo que le falta al número para ser grande:

```js
numeroGrande(44)
  .then((valor) => valor + 100)
  .catch((numero) => { throw 'El número es chico, le falta ' + numero + ' para ser grande' } )

Promise {<rejected>: "El número es chico, le falta 56 para ser grande"}
```

Por último, podemos encadenar las promesas en varias instrucciones `then`:

```js
numeroGrande(200)
  .then((valor) => valor + 100)
  .then((valor) => valor * 2)
  .catch((numero) => { throw 'El número es chico, le falta ' + numero + ' para ser grande' } )

Promise {<resolved>: 600}
```

Recordemos que una vez que iniciamos una promesa, estaremos trabajando siempre en forma asincrónica, ya que el hilo original que estábamos ejecutando quedó pausado por decisión nuestra (nosotros decidimos delegar el control en otras corrutinas que están ejecutándose en el servidor de NodeJS).

## Volviendo a nuestro ejemplo

Pero volvamos una vez más a la idea de

- comprar el electrodoméstico (lo que implica pagar el valor de dicho electrodoméstico)
- volvernos en taxi (lo que implica pagar $ 500)

Cada paso implica una pausa, un momento en el que vamos a delegar el control en el procesador para que se ejecuten otros procesos. La implementación se hace de esta manera:

```ts
  procesoDeCompra(cosa: Electrodomestico, valor: number) {
    return this.comprar(cosa, valor)
      .then(() => {
        this.volverEnTaxi()
      })
  }
```

El método `comprar` no se ejecuta directamente, sino que devuelve una **Promise**, que debemos envolver en un método `then`, que espera un parámetro: una porción de código que nos dice qué debemos hacer cuando la promise se termine de ejecutar. En este caso, cuando estemos ejecutando el then es que ya compramos el televisor, lo que nos falta es volvernos en taxi.

Vemos cómo construimos la promise al comprar:

```js
  comprar(cosa: Electrodomestico, valor: number) {
    return new Promise((resolve, reject) => {
      cosa.validarCompra(valor)
      this.gastar(cosa.descripcion, cosa.valor)
      resolve()
    })
  }
```

Tanto en la validación de la compra como en el gastar, puede ocurrir una excepción:

```ts
class Cliente {
  ...

  gastar(concepto: string, valor: number): void {
    if (this.saldo < valor) {
      throw new Error('No puedo gastar ' + valor + ' en ' + concepto + '. Tengo $ ' + this.saldo)
    }
    this.saldo = this.saldo - valor
  }
```

En ese caso esta excepción debe ser tomada por la ejecución de la promesa de más alto nivel, de la misma manera que lo haríamos asincrónicamente con un try/catch. Pero no hacemos nada en `comprar` ni en `procesoDeCompra`, porque _no tiene mucho sentido hacer nada_, simplemente hay que dejar que falle. Los tests unitarios se encargarán de hacer ese chequeo:

```ts
test('Compra fallida, no me alcanza la plata', () => {
  return cliente.procesoDeCompra(new Electrodomestico('LCD TV', 5100), 6000).catch((e) => {
    expect(e.message).toBe('No puedo gastar 5100 en LCD TV. Tengo $ 5000')
    expect(cliente.saldo).toBe(5000)
  })
})
```

Por el contrario si la compra es exitosa, debemos trabajar el bloque `then`:

```ts
test('Compra exitosa de un LCD TV barata por debajo del saldo del cliente', () => {
  return cliente.procesoDeCompra(new Electrodomestico('LCD TV', 3800), 4000).then(() => {
    expect(cliente.saldo).toBe(700)
  })
})
```

En los tests encontrarán los diferentes escenarios:

- me alcanza para comprar el electrodoméstico, 
  - lo compro porque me parece un precio accesible
    - me vuelvo en taxi => promesa resuelta exitosamente
    - me vuelvo caminando porque me quedé sin plata para el taxi
  - no lo compro porque me parece que es un afano
- no me alcanza para comprar el electrodoméstico

Salvo el caso que explícitamente dice "promesa resuelta exitosamente", los demás tests estarán esperando el error por el catch.

## Equivalencias: async/await

Este formato en el que un proceso como:

```js
funcionSincronica() {
  proceso1()
  const valor = proceso2()
  return proceso3(valor)
}
```

se debe transformar a una función asincrónica en:

```js
funcionAsincronica() {
  proceso1()
    .then(() => proceso2())
    .then((valor) => proceso3(valor))
    // .catch
}
```

Puede resultar un poco confusa, pero por suerte tenemos un _syntactic sugar_ que vuelve a dotar nuestras funciones asincrónicas de Typescript/Javascript como si fueran sincrónicas:

```ts
async function proceso1() {...}

async function proceso2() { ... }

// etc.

async function funcionAsincronica() {
  await proceso1()
  const valor = await proceso2()
  return await proceso3(valor)
}
```

### Algunas consideraciones

Aquí podemos ver que la versión asincrónica con async/await quedó muy parecida a la versión sincrónica original. Solo debemos tener algunos cuidados:

- solo podemos usar `await` dentro de funciones que son asincrónicas, esto puede plantear limitaciones en un script de typescript que debe ejecutar (vean por ejemplo el archivo [clienteAsyncAwait.ts](./src/clienteAsyncAwait.ts) donde sucede ésto)
- una función asincrónica envuelve su resultado en una _promise_

```ts
async funcionUno() {
  return 1
}
```

El tipo de la función 1 es `Promise<number>`, es decir, es una promesa cuyo valor será un número.

- en la `funcionAsincronica` del ejemplo, la línea `const valor = await proceso2()` solo se ejecuta una vez terminado proceso1(). Eso es **exactamente** igual en la versión con promesas:

```ts
funcionAsincronica() {
  proceso1()
    .then(() => proceso2()) // no se ejecuta hasta que no termine proceso1
```

- De lo anterior, se desprende que estas variantes no son equivalentes:

```ts
function proceso(valor) {
  return new Promise((resolve, reject) => { 
    console.log(valor)
    resolve()
  })
}

function asincronica1() {
  proceso(1)
    .then(() => proceso(2))
  proceso(3)
}

async function asincronica2() {
  await proceso(1)
  await proceso(2)
  await proceso(3)
}
```

¿Por qué? ¿En qué orden se ejecuta cada una?

```js
asincronica1()
VM314:3 1
VM314:3 3
VM314:3 2


asincronica2()
VM314:3 1
VM314:3 2
VM314:3 3
Promise {<resolved>: undefined}
```

## Soluciones

- Promises: [solución original](./src/cliente.ts), con los [tests](./src/cliente.spec.ts)
- Async/Await: [solución original](./src/clienteAsyncAwait.ts), con los [tests](./src/clienteAsyncAwait.spec.ts)

## Herramientas

- [Javascript Visualizer 9000](https://www.jsv9000.app/), donde podés ver cómo funciona el call stack, el event loop y la cola de ejecución de procesos. Por ejemplo este [test básico](https://www.jsv9000.app/?code=ZnVuY3Rpb24gcHJ1ZWJhKCkgewogIGNvbnNvbGUubG9nKCIxIikKICBjb25zb2xlLmxvZygiMiIpCiAgLy8gc2V0VGltZW91dChmdW5jdGlvbigpIHsgY29uc29sZS5sb2coIjIiKSB9LCAwKQogIGNvbnNvbGUubG9nKCIzIikKfQoKcHJ1ZWJhKCk%3D).

Y para entender cómo la promise pone en la Task Queue las funciones, probemos este otro ejemplo:

```js
function sumar1(valor) {
  console.log(valor)
  return valor + 1
}

console.log('arranco')
Promise.resolve(1)
  .then(sumar1)
  .then(sumar1)
  .then((valor) => console.log('valor final', valor))
console.log('termino')
```

Ahí vemos cómo el console.log que escribe "termino" en realidad es solo la tercera instrucción

Te dejamos en una carpeta especial [varios ejemplos](./ejemplos_visualizer/) para que pruebes.


## Videos explicativos

- [What the heck is the event loop anyway](https://www.youtube.com/watch?v=8aGhZQkoFbQ), lejos, una descomunal presentación de Philip Roberts.  
- [The Node.js Event Loop: not so single thread](https://www.youtube.com/watch?v=zphcsoSJMvM), gran explicación de Bryan Hughes

## Material adicional

- [Usar promesas](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Usar_promesas)
- [We have a problem with promises](https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html)
- [6 things you may not know about promises](https://www.sitepoint.com/six-things-might-know-promises/)
- [Qué son y cómo funcionan las promesas en Javascript](https://platzi.com/blog/que-es-y-como-funcionan-las-promesas-en-javascript/)
- Async / Await
- [Javascript Info: Async / Await](https://javascript.info/async-await)
- [Alligator: async functions](https://alligator.io/js/async-functions/)
