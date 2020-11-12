window.addEventListener('load',inicio);

const { Observable, interval, from } = rxjs;
const { tap, take, map,
        concatMap, switchMap, mergeMap } = rxjs.operators;

/* **************************************************** 
   Los OBSERVABLES DE ORDEN SUPERIOR son observables que
   emite a su vez otros observables, a diferencia de los
   observables de primer orden que emiten valores.
   
   Los Operadores de Mapeo de Orden Superior (tienen el
   sufijo Map) transforman observables de orden superior.

   Para ello, mapean cada valor de un observable externo
   a un observable interno y, automáticamente, realizan
   la suscripción y cancelación del observable interno.

   NOTA: Recordemos que para que un observable empiece
   a emitir valores es necesario que nos suscribamos
   
   Los observables de orden superior nos evitan que 
   tengamos que anidar suscripciones de observables.
   
   -A-P-F-M   ----> Observable externo 
    \ \ \ \
     \ \ \ \--M--M-|->    |
      \ \ \--X->          |---> Observables internos
       \ \--S--S-|->      |
        \--L--L--L-|->    |
 
   - concatMap: Espera a que se complete cada observable
      interno antes de procesar el siguiente. Concatena
      los resultados de los observables internos en 
      secuencia (se mantiene el orden).

   - mergeMap: Procesa cada observable interno en
      paralelo, fusionando los resultados de los observables
      internos a medida que estos se van completando (es
      posible que no se mantenga el orden).

   - switchMap: Cancela la suscripción de cualquier 
      observable interno anterior y cambia a cualquier
      observable interno nuevo al que llamemos.

* *****************************************************/
class Persona{
    constructor(nombre, edad, aficion){
      this.nombre = nombre;
      this.edad = edad;
      this.aficion = aficion;
    }  
}  
  
class Aficion{
     constructor(nombre,lista){
       this.nombre = nombre;
       this.lista = lista;
     }  
}
  
let personas = [new Persona('Antonio',42,'Lectura'),
                new Persona('Patri',43,'Senderismo'),
                new Persona('Fer',47,'Escalada'),
                new Persona('Maria',46,'Musica')
];
  
let posibilidades = [
    new Aficion('Lectura', ['It','Tierra','22/11/63']),
    new Aficion('Senderismo',['Las Cabrillas','Cerro Larda']),
    new Aficion('Musica',['ColdPlay','Clásica'])  
];  
  
function usuarios$(){
    return interval(1000).pipe(
       take(4),
       map(pos => personas[pos])    
    );
}
  
  
function aficiones$(aficion){
    let aficiones = [];
   
    posibilidades.forEach(
      (afic) => {
        if (afic.nombre === aficion){
          aficiones = afic.lista;
        }  
      }  
    )
   
    return interval(2000).pipe(    
       take(aficiones.length),
       map(pos => aficiones[pos])
    );
}

function inicio(){
    let visor = document.querySelector("#visor"); 

    //-A-P-F-M   ----> Observable externo 
    // \ \ \ \
    //  \ \ \ \--M--M-|->    |
    //   \ \ \--X->          |> Observables internos
    //    \ \--S--S-|->      |
    //     \--L--L--L-|->    |

    /* ConcatMap.
       ---------- 
       Resultado:

       {"usuario":"Antonio","aficion":"Lectura","opcion":"It"}
       {"usuario":"Antonio","aficion":"Lectura","opcion":"Tierra"}
       {"usuario":"Antonio","aficion":"Lectura","opcion":"22/11/63"}
       {"usuario":"Patri","aficion":"Senderismo","opcion":"Las Cabrillas"}
       {"usuario":"Patri","aficion":"Senderismo","opcion":"Cerro Larda"}
       {"usuario":"Maria","aficion":"Musica","opcion":"ColdPlay"}
       {"usuario":"Maria","aficion":"Musica","opcion":"Clásica"} 
    
    operConcatMap();
    */

    /*
       MergeMap.
       ---------
       Resultado:

       {"usuario":"Antonio","aficion":"Lectura","opcion":"It"}
       {"usuario":"Patri","aficion":"Senderismo","opcion":"Las Cabrillas"}
       {"usuario":"Antonio","aficion":"Lectura","opcion":"Tierra"}
       {"usuario":"Maria","aficion":"Musica","opcion":"ColdPlay"}
       {"usuario":"Patri","aficion":"Senderismo","opcion":"Cerro Larda"}
       {"usuario":"Antonio","aficion":"Lectura","opcion":"22/11/63"}
       {"usuario":"Maria","aficion":"Musica","opcion":"Clásica"} 

       operMergeMap()
    */

    /*
      switchMap.
      ----------
      Resultado:

      {"usuario":"Maria","aficion":"Musica","opcion":"ColdPlay"}
      {"usuario":"Maria","aficion":"Musica","opcion":"Clásica"} 

      ¿Por qué salen sólo los de María? Porque cada segundo nos
      suscribimos al observable interno, pero este emite su valor
      cada dos segundos (por lo que no le da tiempo a emitir el valor
      al cancelarse la suscripción en el segundo siguiente).

      Si el observable interno emitiera cada 100 milisegundos no
      perderíamos ninguno de los resultados:

      {"usuario":"Antonio","aficion":"Lectura","opcion":"It"}
      {"usuario":"Antonio","aficion":"Lectura","opcion":"Tierra"}
      {"usuario":"Antonio","aficion":"Lectura","opcion":"22/11/63"}
      {"usuario":"Patri","aficion":"Senderismo","opcion":"Las Cabrillas"}
      {"usuario":"Patri","aficion":"Senderismo","opcion":"Cerro Larda"}
      {"usuario":"Maria","aficion":"Musica","opcion":"ColdPlay"}
      {"usuario":"Maria","aficion":"Musica","opcion":"Clásica"} 

      operSwitchMap()
   */
  
   operSwitchMap();
}

function operConcatMap(){
    usuarios$().pipe(
        concatMap(
            usuario => {
            return aficiones$(usuario.aficion).pipe(
                map(
                    aficion => {
                        return {
                                usuario: usuario.nombre,
                                aficion: usuario.aficion,
                                opcion: aficion 
                        };
                    }
                )
            )
            }  
        )
    ).subscribe(
        val =>  visor.innerHTML += `${JSON.stringify(val)} <br/>`
    );
}

function operMergeMap(){
    usuarios$().pipe(
        mergeMap(
            usuario => {
            return aficiones$(usuario.aficion).pipe(
                map(
                    aficion => {
                        return {
                                usuario: usuario.nombre,
                                aficion: usuario.aficion,
                                opcion: aficion 
                        };
                    }
                )
            )
            }  
        )
    ).subscribe(
        val =>  visor.innerHTML += `${JSON.stringify(val)} <br/>`
    );
}

function operSwitchMap(){
    usuarios$().pipe(
        switchMap(
            usuario => {
            return aficiones$(usuario.aficion).pipe(
                map(
                    aficion => {
                        return {
                                usuario: usuario.nombre,
                                aficion: usuario.aficion,
                                opcion: aficion 
                        };
                    }
                )
            )
            }  
        )
    ).subscribe(
        val =>  visor.innerHTML += `${JSON.stringify(val)} <br/>`
    );
}