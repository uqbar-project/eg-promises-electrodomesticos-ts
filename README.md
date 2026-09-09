# Ejemplo introductorio Promises

[![build](https://github.com/uqbar-project/eg-promises-electrodomesticos-ts/actions/workflows/build.yml/badge.svg)](https://github.com/uqbar-project/eg-promises-electrodomesticos-ts/actions/workflows/build.yml) [![codecov](https://codecov.io/gh/uqbar-project/eg-promises-electrodomesticos-ts/graph/badge.svg?token=WYVGPG3UPN)](https://codecov.io/gh/uqbar-project/eg-promises-electrodomesticos-ts)

## Introducción

Supongamos la siguiente situación:

![circuito](./images/circuito.png)

Queremos ir a comprar un electrodoméstico. Un televisor para ser más precisos. El circuito completo sería:

- Vamos caminando al negocio (nuestra ubicación cambia).
- Compramos el LCD TV; el precio sale del catálogo [productos.json](./productos.json), donde hay 50 productos y el id 14 corresponde al "LCD TV" de $ 1000.
- Nos volvemos en taxi con el televisor: el costo depende de la distancia entre el negocio y nuestra casa, que se consulta a un servicio de rutas.

### Restricciones

Algunas restricciones que podemos tener:

- que no tengamos suficiente dinero para pagar el televisor.
- que no tengamos suficiente dinero para pagar el taxi.

## Primera implementación

Podríamos pensar en una clase cliente que tenga la siguiente lógica

```ts
class Cliente {
  saldo: number = 5000

  procesoDeCompra(cosa: Electrodomestico) {
    // ir caminando no tiene efecto en nuestro código
    const producto = cosa.obtenerProducto()
    // valido que tenga suficiente plata, y bajo el saldo
    this.gastar(producto.descripcion, producto.precio)
    // similar a this.gastar('Taxi', 500)
    this.volverEnTaxi()
  }
}
```

En esta solución **todo ocurre casi inmediatamente**. Y en realidad, cada proceso puede demorar un tiempo: leer el catálogo de productos del archivo `productos.json`, la decisión de la compra, e incluso tomar el taxi (el cual requiere consultar un servicio de rutas para saber la distancia).

## Sincrónico vs. asincrónico

Nuestra solución así planteada es **sincrónica**:

- la instrucción siguiente ocurre inmediatamente después de que se ejecutó la instrucción anterior
- si una instrucción devuelve un valor, puede ser referenciado por una variable, por ejemplo:

```ts
const producto = cosa.obtenerProducto()
```

- el método `procesoDeCompra` se ejecuta sincrónicamente, esto implica que en ningún momento otro proceso puede utilizar la VM. Esto lo hacemos porque sabemos que todas las operaciones no consumen recursos, ni demoran más del tiempo "razonable". No obstante, tenemos muchos casos donde estas situaciones no se pueden garantizar, porque salimos del cómodo entorno de nuestra máquina virtual: operaciones de I/O (como leer un archivo o hacer una llamada a un servicio de rutas), acceso a recursos compartidos y concurrencia nos pueden jugar una mala pasada.

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
Promise {<rejected>: 'El número es chico'}
```

¿Qué devuelve la función `numeroGrande(5)`? una **promesa rechazada**, indicando que el número es chico. Si en cambio evaluamos la función con un número más grande:

```js
numeroGrande(550)
Promise {<resolved>: 550}
```

La promesa se resuelve exitosamente y devuelve como valor el número que le pasamos. Este valor lo podemos recuperar y utilizarlo, mediante el método `then`, de la siguiente manera:

```js
numeroGrande(550)
  .then((valor) => valor + 100)
Promise {<resolved>: 650}
```

Aquí vemos que el `then` **genera una nueva promesa**, con el valor correspondiente: 550 + 100. ¿Pero qué pasa si queremos pasarle un número no tan grande?

```js
numeroGrande(50).then((valor) => valor + 100)
Promise {<rejected>: 'El número es chico'}
```

La consola nos tira un error indicando que el número es chico. Podemos atrapar ese error mediante la expresión `catch`:

```js
numeroGrande(50)
  .then((valor) => valor + 100)
  .catch((message) => { throw message } )
Promise {<rejected>: 'El número es chico'}
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

Promise {<rejected>: "El número es chico, le falta 56 para ser grande"}
```

Por último, podemos encadenar las promesas en varias instrucciones `then`:

```js
numeroGrande(200)
  .then((valor) => valor + 100)
  .then((valor) => valor * 2)
  .catch((numero) => { throw 'El número es chico, le falta ' + numero + ' para ser grande' } )

Promise {<resolved>: 600}
```

Recordemos que una vez que iniciamos una promesa, estaremos trabajando siempre en forma asincrónica, ya que el hilo original que estábamos ejecutando quedó pausado por decisión nuestra (nosotros decidimos delegar el control en otras corrutinas que están ejecutándose en el servidor de NodeJS).

## Volviendo a nuestro ejemplo

Pero volvamos una vez más a la idea de

- comprar el electrodoméstico (lo que implica leer el catálogo del archivo `productos.json` y pagar el valor de dicho electrodoméstico)
- volvernos en taxi (lo que implica consultar la distancia del viaje y pagar el valor del taxi)

Cada paso implica una pausa, un momento en el que vamos a delegar el control en el procesador para que se ejecuten otros procesos. La implementación se hace de esta manera:

```ts
  procesoDeCompra(cosa: Electrodomestico): Promise<void> {
    return Promise.resolve()
      .then(() => this.comprar(cosa))
      .then(() => this.volverEnTaxi())
  }
```

El método `comprar` no se ejecuta directamente, sino que devuelve una **Promise**, que debemos envolver en un método `then`, que espera un parámetro: una porción de código que nos dice qué debemos hacer cuando la promise se termine de ejecutar. En este caso, cuando estemos ejecutando el then es que ya compramos el televisor, lo que nos falta es volvernos en taxi.

Vemos cómo construimos la promise al comprar:

```ts
  comprar(cosa: Electrodomestico): Promise<void> {
    return cosa.obtenerProducto().then((productoBuscado) => {
      this.gastar(productoBuscado.descripcion, productoBuscado.precio)
    })
  }
```

El primer paso es obtener el producto del catálogo `productos.json`, que es una operación de I/O asincrónica. Hacemos una lectura con `readFile` (de `node:fs/promises`) y encadenamos con un `then` el parseo del JSON y la búsqueda del producto por su id:

```ts
  obtenerProducto(): Promise<Producto> {
    const urlDelArchivo = new URL('../productos.json', import.meta.url)
    return readFile(urlDelArchivo, 'utf-8')
      .then((contenidoDelArchivo) => JSON.parse(contenidoDelArchivo) as Producto[])
      .then((productos) => this.buscarProducto(productos, this.id))
  }
```

Si el producto no existe en el catálogo, lanzamos un error:

```ts
  private buscarProducto(productos: Producto[], id: number): Producto {
    const productoBuscado = productos.find((producto) => producto.id === id)
    return productoBuscado ?? lanzarError(`No existe el producto ${id}`)
  }
```

Ya con el producto en mano, gastamos su precio. Acá tenemos una decisión de diseño: `gastar` es una operación **sincrónica** (solo resta el valor del saldo, no hace I/O), así que no devuelve una promise. Si el saldo no alcanza, **lanza una excepción**:

```ts
  gastar(concepto: string, valor: number): void {
    if (this.saldo < valor) {
      throw new Error('No puedo gastar ' + valor + ' en ' + concepto + '. Tengo $ ' + this.saldo)
    }
    this.saldo = this.saldo - valor
  }
```

Y acá está lo interesante: aunque `gastar` es síncrono, lo invocamos **dentro de un `then`**. Cuando una excepción se lanza dentro de un `then` (o dentro de una función async/await), la promise queda **rechazada** automáticamente. Así la falla de saldo se propaga por el encadenado y podemos capturarla con el `catch` (o con `rejects`) como cualquier rechazo de promise, aunque haya ocurrido en una línea sincrónica.

No hacemos nada en `comprar` ni en `procesoDeCompra`, porque _no tiene mucho sentido hacer nada_, simplemente hay que dejar que falle. Los tests unitarios se encargarán de hacer ese chequeo.

### ¿De dónde sale el valor del taxi?

El cliente conoce su casa (`casa`) y se ubica inicialmente en ella. Cuando camina hasta el negocio, su `ubicacion` cambia:

```ts
const casaDelCliente = new Location(-58.3816, -34.6037)
const ubicacionDelNegocio = new Location(-58.5282, -34.5775)
const cliente = new Cliente(5000, casaDelCliente)
cliente.caminarA(ubicacionDelNegocio)   // ahora ubicacion = ubicacionDelNegocio
```

Al volver en taxi, el destino es la casa. Para saber cuánto cuesta, consultamos un servicio de rutas (OSRM) que nos devuelve la distancia en metros entre la ubicación actual y la casa:

```ts
  armarViaje(origen: Location, destino: Location): Promise<number> {
    const urlDelViaje = `https://router.project-osrm.org/route/v1/driving/${origen.longitud},${origen.latitud};${destino.longitud},${destino.latitud}?overview=false`
    return fetch(urlDelViaje)
      .then((respuesta) => respuesta.json())
      .then((datosDelViaje) => datosDelViaje.routes[0].distance)
  }

  volverEnTaxi(): Promise<void> {
    return this.armarViaje(this.ubicacion, this.casa).then((distanciaEnMetros) => {
      this.gastar('Taxi', (distanciaEnMetros / 1000) * VALOR_POR_KM)
    })
  }
```

El valor del taxi se calcula multiplicando la distancia en kilómetros por `VALOR_POR_KM` ($ 25). En los tests simulamos una distancia de 20 kilómetros, por eso el taxi sale $ 500.

### Los tests

En los tests encontrarán los diferentes escenarios:

```ts
test('Compra exitosa de un LCD TV barata por debajo del saldo del cliente', () => {
  mockFetch(20000) // 20 kilómetros => $ 500 de taxi
  const cliente = new Cliente(2000, casaDelCliente)
  cliente.caminarA(ubicacionDelNegocio)
  return cliente.procesoDeCompra(electrodomestico).then(() => {
    expect(cliente.saldo).toBe(500)
  })
})
```

Por el contrario si la compra es exitosa pero no nos alcanza para el taxi, o si directamente no nos alcanza para el televisor, la promesa se rechaza. Para verificar el rechazo (sin usar async/await) usamos el matcher `rejects`, que espera una promise, y encadenamos con un `then` el chequeo del saldo:

```ts
test('Compra exitosa, pero no puede volver en Taxi', () => {
  mockFetch(20000)
  const cliente = new Cliente(1400, casaDelCliente)
  cliente.caminarA(ubicacionDelNegocio)
  return expect(cliente.procesoDeCompra(electrodomestico))
    .rejects.toThrow('No puedo gastar 500 en Taxi. Tengo $ 400')
    .then(() => expect(cliente.saldo).toBe(400))
})

test('Compra fallida, no me alcanza la plata', () => {
  mockFetch(20000)
  const cliente = new Cliente(900, casaDelCliente)
  cliente.caminarA(ubicacionDelNegocio)
  return expect(cliente.procesoDeCompra(electrodomestico))
    .rejects.toThrow('No puedo gastar 1000 en LCD TV. Tengo $ 900')
    .then(() => expect(cliente.saldo).toBe(900))
})
```

En la versión async/await usamos el mismo matcher, pero con `await` en lugar de encadenar (así la línea queda parecida a una espera síncrona):

```ts
await expect(cliente.procesoDeCompra(electrodomestico)).rejects.toThrow('No puedo gastar 1000 en LCD TV. Tengo $ 900')
```

De esta manera el caso de éxito se verifica con el bloque `then`, y los errores con el matcher `rejects`.

Para que los tests sean determinísticos (y no dependan de la red ni del contenido real del archivo), se simulan las dos operaciones asincrónicas:

- `readFile` se mockea con `vi.mock('node:fs/promises')`, devolviendo el catálogo con un único producto: el LCD TV de $ 1000.
- `fetch` se reemplaza por un stub que responde el resultado de OSRM con una distancia fija (20000 metros).

Los escenarios cubiertos son:

- me alcanza para comprar el electrodoméstico y para el taxi => promesa resuelta exitosamente, me queda $ 500.
- me alcanza para comprar el electrodoméstico pero no para el taxi => promesa rechazada, me queda $ 400.
- no me alcanza para comprar el electrodoméstico => promesa rechazada, mi saldo no cambia ($ 900).

Salvo el caso que explícitamente dice "promesa resuelta exitosamente", los demás tests estarán esperando el rechazo con el matcher `rejects`.

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

- solo podemos usar `await` dentro de funciones que son asincrónicas, esto puede plantear limitaciones en un script de typescript que debe ejecutar. Para experimentar, podés correr cualquier ejemplo de la carpeta `ejemplos_visualizer` o usar el [Javascript Visualizer 9000](#herramientas).
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
Promise {<resolved>: undefined}
```

## Soluciones

- Promises: [solución](./src/promises/clientePromises.ts), con los [tests](./src/promises/clientePromises.spec.ts)
- Async/Await: [solución](./src/asyncAwait/clienteAsyncAwait.ts), con los [tests](./src/asyncAwait/clienteAsyncAwait.spec.ts)

En la carpeta `src/promises` vas a encontrar la versión encadenando promises (con `then` y `catch`), y en `src/asyncAwait` la equivalente con `async`/`await`. El comportamiento de ambas es idéntico: las diferencias son de sintaxis.

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