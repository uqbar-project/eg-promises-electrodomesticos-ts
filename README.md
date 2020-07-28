# Ejemplo básico de promises

En este ejemplo queremos resolver el promedio de edad de alumnos de un curso. Esto implica

- obtener la lista de alumnos
- transformarlo en una lista de edades (números)
- luego sumar y saber la cantidad de elementos
- y finalmente obtener el promedio

## Solución sincrónica

En la solución sincrónica, todo es bastante directo: envío un mensaje y obtengo una respuesta inmediata

```ts
const promedio = promedioEdadAlumnosSync()
console.log('- Promedio de edades sincrónicas es: ', promedio)
```

La función tiene una estructura de control de secuencia, conocida por todos:

```ts
export function promedioEdadAlumnosSync(): number {
  const edades = getAlumnos().map((alumno: Alumno) => edad(alumno))
  const sumaEdades = suma(edades)
  const totalEdades = longitud(edades as unknown as object[])
  return sumaEdades / totalEdades
}
```

## Solución asincrónica con promises

Las promises permiten encolar procesos asincrónicos, y su constructor espera una función con dos parámetros

- un callback por el caso feliz
- un callback por el caso con error

En el caso de los alumnos, recibimos el callback por el caso feliz y lo invocamos (mediante los paréntesis) pasándole como argumentos la lista de alumnos que devuelve la función sincrónica getAlumnos():

```ts
export function a_getAlumnos(): Promise<Alumno[]> {
  return new Promise((resolve) => resolve(getAlumnos()))
}
```

`resolve` es una función que acepta un parámetro. Recordemos cómo invocar una función en typescript:

```ts
> const masUno = (valor) => valor + 1
undefined
> masUno
(valor) => valor + 1
> masUno(3)
4
```

E incluso, podemos jugar un toque con las promises:

```ts
const dameUnUno = new Promise((resolve) => resolve(1))
// me devuelve una promise resuelta, con el valor 1

dameUnUno.then(numero => console.log(numero))
// dentro del then envolvemos una función que se ejecuta una vez que se resuelve la promesa
1
```

Como resultado, es bastante más tedioso resolver el mismo requerimiento. Al invocar la función, le pasamos como callback la función que la imprime por consola:

```ts
promedioEdadAlumnosPromise(
  (promedioPromise: number) => console.log('- Promedio de edades asincrónicas con promises es: ', promedioPromise)
)
```

La función promedio de edad de alumnos con promises queda:

```ts
export function promedioEdadAlumnosPromise(callback: (promedio: number) => void): void {
  a_getAlumnos().then(
    (alumnos: Alumno[]) => {
      const promisesAlumnos = alumnos.map((alumno) => a_edad(alumno))
      Promise
        .all(promisesAlumnos)
        .then((edades) => {
          return Promise.all([
            a_suma(edades),
            a_longitud(edades as unknown as object[]),
          ])
        })
        .then(([sumaEdades, cantidad]) => {
          const promedio = sumaEdades / cantidad
          callback(promedio)
        })
        .catch((e) => console.log('error', e))
    })
}
```

- ya no podemos ejecutar directamente el código que sigue, sino que debemos envolverlo dentro de una cadena de `then` que define una _promise_ nueva
- cualquier error se atrapa con una nueva promise que se genera mediante la función `catch` al final de la cadena de llamadas asincrónicas
- y para poder paralelizar varias tareas asincrónicas, `Promise.all` permite disparar asincrónicamente varias tareas, y agrupa los resultados en una lista de resultados en el siguiente callback que se le pase a `then`

El lector podrá pensar que es complejo, y ciertamente lo es. Pero anteriormente era obligatorio anidar los `then` uno dentro de otro, lo que producía código mucho más intrincado que el encadenamiento de `then`s hermanos.

## ¿Por qué queremos trabajar asincrónicamente...

...si sincrónico es más fácil?

Porque la VM de JS solo puede hacer una tarea a la vez. Trabaja en forma sincrónica, pero con un solo thread. Esto implica que cualquier operación que lleva mucho tiempo, o que eventualmente podría no terminar nunca, colgaría el _runtime_ de la máquina virtual de Javascript (sea en node, en un browser, etc.)

![event loop in JS](https://miro.medium.com/max/1275/1*9iOmFwC3PWUD8RFLsxzBXQ.jpeg)

(extraída de [este artículo](https://medium.com/better-programming/is-javascript-synchronous-or-asynchronous-what-the-hell-is-a-promise-7aa9dd8f3bfb))

Entonces es conveniente que cada llamada a algo que no controlamos nosotros sea asincrónica, indicando

- cómo seguir en caso de éxito
- cómo seguir en caso de error

El ejemplo es didáctico, la lista de alumnos podría salir de un servicio REST, o bien podríamos tener un cálculo complejo y aislado en otro componente en lugar de la sumatoria de edades y la longitud de la lista. En definitiva, debemos ser cuidadosos al trabajar en este tipo de entornos separando las operaciones que pueden mantener el sincronismo de las que no (basándonos en si tenemos completo control de dichas operaciones).

[Podés ver este video de Philip Roberts explicando el event loop de JS](https://www.youtube.com/watch?v=8aGhZQkoFbQ).

## Async / await to the rescue

Lo que perdimos con el asincronismo son dos instrucciones no menores:

- el **return**
- y el **throw**

gracias al mecanismo `async / await` tenemos la posibilidad de generar una función asincrónica que trabaje en forma muy similar a la versión sincrónica. Para esto

- es necesario avisar que la función es asincrónica
- y cada llamada asincrónica se envuelve con una instrucción `await` que permite asignarlo a una variable o continuar normalmente con nuestra definición de método o función
- un dato no menor: cada operación `await` bloquea la ejecución de nuestra función asincrónica. Ojo, **no bloquea el thread**, sino que no continua ejecutando el código siguiente hasta que no se termina de ejecutar el código envuelto en el await. Entonces, vamos a seguir usando `Promise.all` para paralelizar lo que podamos: conseguir los datos de los alumnos, sumar las edades y obtener la longitud son operaciones paralelizables.

```ts
export async function promedioEdadAlumnosAsyncAwait(): Promise<number> {
  const alumnos: Alumno[] = await a_getAlumnos()
  const edades = await Promise.all(alumnos.map((alumno) => a_edad(alumno)))
  const [sumaEdades, cantidadEdades] = await Promise.all([
    a_suma(edades),
    a_longitud(edades as unknown as object[]),
  ])
  const promedio = sumaEdades / cantidadEdades
  return promedio
}
```

Pueden leer [este artículo interesante](https://www.freecodecamp.org/news/avoiding-the-async-await-hell-c77a0fb71c4c/).

La llamada desde el `index.ts` es muy simple:

```ts
promedioEdadAlumnosAsyncAwait()
  .then((promedioAA: number) => console.log('- Promedio de edades con async/await es: ', promedioAA))
  .catch((e) => console.log('Error en el async / await!', e))
```

Claro, requiere que la envolvamos en una promise porque es una función asincrónica. Podríamos hacer dentro de index, ésto:

```ts
imprimirPromedioEdadAlumnos()

async function imprimirPromedioEdadAlumnos() {
  const promedio = await promedioEdadAlumnos()
  console.log('- Promedio de edades con async/await es: ' + promedio)
}
```

pero no es una buena práctica, porque uno podría tentarse de hacer:

```ts
const respuesta = imprimirPromedioEdadAlumnos()
```

y ojo, respuesta es **una Promise de algo, no ese algo**.

## Mecanismo de async / await vs. promise

### A favor

- es más simple
- recuperamos estructuras como el try/catch y el return que nos son familiares
- transforman una composición de funciones en una función única

### En contra

- bloquean el flujo de ejecución de nuestro código, por lo que hay que tener cuidado con las operaciones que pueden paralelizarse de no tentarse a trabajar siempre con `await` (ej. muchas operaciones de escritura en la base o llamar a varios servicios REST que capturan datos diferentes)
- cuando hacemos

```ts
async funcionGeneral(param) {
  const result = await funcion1(param)
  await funcion2(result)
}
```

vs.

```ts
funcion1(param).then(result => funcion2(result))
```

en la variante con async/await no nos damos cuenta que estamos trabajando con funciones. Entonces una ventaja que tienen las promises es que nosotros podríamos componer **funcion1 . funcion2** o **funcion2 . funcion1**, basta con que la imagen de la primera función coincida con el dominio de la segunda:

```ts
funcion2(param).then(result => funcion1(result))
```

mientras que en la versión con async/await estoy obligado a definir una nueva función. Las opciones con async/await son más limitadas.

## Cómo testear el ejemplo

```bash
npm install
npm start
```

## Temas periféricos que ocurren en este ejemplo

- [Tipo **unknown**](https://mariusschulz.com/blog/the-unknown-type-in-typescript)

## Resumen para el manejo de asincronismo en la VM de Javascript

Les dejamos esta tabla que muestra un breve resumen de los diferentes métodos que vimos para manejar el asincronismo dentro de la máquina virtual de Javascript, particularmente dentro de Typescript. 

![async-cheatsheet](images/async-cheatsheet.png)

Fuente: [Frontend Armory](https://github.com/frontarm/async-javascript-cheatsheet)
