# Lunar Guardians

Juego 2D Canvas de exploración lunar, individual o cooperativo en línea para cuatro personas. Abre la carpeta en VS Code y ejecuta `npm start` (desde la raíz o lunar-guardians); visita http://127.0.0.1:8765. También puedes usar F5 con la configuración del proyecto. Detén el servidor anterior con Ctrl+C antes de reiniciarlo. Node.js 22.9 o posterior; ejecuta `npm install` la primera vez.


## Versión de exploración en tiempo continuo

- Estética pixel art y animaciones direccionales, base con ocho módulos, música (cuatro pistas), controles y menús ES/EN. Los textos científicos y procedimientos detallados siguen en español.
- El Centro de Mando asigna dos expediciones: recoger muestras y explorar una baliza. El rover está disponible desde el inicio junto a la salida exterior. Regresa por la esclusa para entregar los hallazgos: generan ciencia, datos y recursos para los módulos originales.
- WASD/flechas: caminar. E: consola, recoger o esclusa. R: subir/bajar del rover. J: bitácora. Esc: menú. En individual, 1–4 cambia personaje. En línea cada persona escribe su nombre y recibe un color; puede usar todos los módulos.
- Cada fase dura 110 segundos (tiempo comprimido de juego, no un día lunar real). Energía, aire, agua, comida y cultivos evolucionan continuamente, incluso durante minijuegos y menús. No existe botón para terminar turno. La misión dura siete fases; la pantalla muestra tiempo restante y objetivos.
- Dormitorio: recupera 30 salud sin consumir alimentos, con 45 segundos entre descansos. Cultivos: F consume 5 alimentos de reserva y recupera 35 de alimentación personal. Taller: crea tanque mejorado, botas y linterna usando mineral/hielo exterior; recarga rover por 10 energía.
- Las zonas de exposición exterior están señaladas antes de activarse. La radiación y la salud son indicadores de juego, no predicciones ni dosis científicas. Las crisis documentadas DONKI se conservan y agravan la exposición y los sistemas.
- Victoria: 60 ciencia, motor al 100%, 50 datos enviados, informe entregado y rescate confirmado. Las excursiones ayudan; sigue siendo necesario gestionar los módulos y sus minijuegos.
- Multijugador: Firebase conserva salas y nombres. El servidor calcula el reloj, recursos, entregas y daño, con reservas de módulos para impedir decisiones simultáneas incompatibles. Sin jugadores conectados, el reloj se detiene. Una plaza desconectada puede reconectar usando su misma sesión.

Pruebas actuales: `node realtime-tests.cjs`, `node realtime-browser-tests.cjs`, `npm run test:operations`. Los escenarios deterministas de navegador eligen explícitamente datos sin conexión; la operación normal consulta NASA. Los tests antiguos por turnos se conservan como referencia del motor anterior.

Arte procedural, disposición y audio adaptados de la versión del compañero en `otra version del juego/juegos-main`; se conserva el código de referencia sin modificar. Los cuatro audios se distribuyen como recursos locales.

## APIs NASA: funcionamiento actual

Al abrir el juego se consultan **DONKI y JPL Horizons automáticamente** a través del servidor local. Espera el indicador “NASA conectada”, abre **Preparar misión · APIs NASA** y selecciona la ubicación; los eventos no se eligen. “Consultar APIs de nuevo” efectúa una nueva consulta, no usa la antigua caché de 24 horas. Las solicitudes simultáneas comparten una sola operación.

Hay **dos ubicaciones de aterrizaje**, distintas de los **eventos solares**: estos proceden de la respuesta DONKI de los últimos 30 días UTC. El catálogo C/M/X alimenta automáticamente las crisis. Al iniciar se sortean una o dos, de registros distintos y en fases diferentes. La cantidad y el calendario no se anuncian. Se conservan al guardar/cargar: recargar no vuelve a sortearlos. Una respuesta vacía es válida y produce una misión sin crisis solar. No se generan eventos ficticios para llenar el selector.

### Cómo verificar DONKI y cuándo ocurre la crisis

En Preparar misión o Entorno y conexión NASA, pulsa **Ver evidencia de la consulta**. Se muestran:

- Endpoint consultado, intervalo de fechas, hora de consulta y estado HTTP.
- Cantidad de registros recibidos y eventos utilizables.
- ID, clase y fecha de las crisis ya detectadas, con enlace a su registro NASA. Los eventos futuros permanecen ocultos en la interfaz.
- JSON original de los registros de las crisis ya detectadas, desplegable.

Las crisis se recrean **en turnos sorpresa**: una alerta al entrar al turno permite reaccionar antes de cerrar. Cada crisis afecta inmediatamente a la transmisión; al cerrar ese turno se aplican daño de paneles y exposición de tripulantes. El HUD anuncia el turno y la bitácora conserva el ID DONKI. La proyección de cierre no revela alertas de turnos futuros. Una crisis menos intensa no repara los paneles dañados por una anterior. Los efectos son simulados; la fecha observada por NASA no se presenta como una predicción de impacto en la base.

| Clase | Paneles después de la crisis | Datos por transmisión normal en alerta | Pérdida de seguridad por tripulante sin refugio |
|---|---:|---:|---:|
| C | 90% | 10 | 8 |
| M | 80% | 8 | 16 |
| X | 65% | 5 | 24 |

Hay 4 de desgaste común durante la alerta. Potencia extra conserva 30 datos por 25 energía. Un tercer refugio protege a los cuatro tripulantes. Durante la noche la generación ya es cero, independientemente del daño solar.

La última respuesta completa del servidor puede inspeccionarse en `/api/nasa/audit`, con sus fechas; no inicia otra consulta. En las herramientas del navegador, Red → `/api/nasa` permite ver la consulta que preparó la misión. Las claves nunca se incluyen en estas respuestas.

### API key y endpoint oficial

Pon tu clave en `lunar-guardians/.env`:

```dotenv
NASA_API_KEY=TU_CLAVE
```

Reinicia `npm start`. La clave no se envía al navegador ni se sirve desde `dist`; `.env` está excluido de Git. Sin clave se consulta directamente el servicio público CCMC.

Si la pasarela `https://api.nasa.gov/DONKI/FLR` responde 404 o 410, el servidor consulta **la API oficial activa** `https://ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR`, que no requiere clave. La pantalla informa del código de la pasarela y del endpoint realmente usado. Esto es otra consulta por internet, no un archivo de reemplazo. Errores de autenticación, red o formato se muestran como fallo; no se ocultan como éxito.

### Mapa lunar y posiciones

- Aurora: 0.674° N, 23.47° E. Aurora Este: 5° N, 30° E. Son bases ficticias en coordenadas reales.
- Cada ubicación carga nueve teselas regionales diferentes de **Moon Trek WMTS**, LRO WAC, NASA/GSFC/Arizona State University. Zoom 5, región de 16.875° por lado; norte arriba. El mosaico es un producto de archivo consultado por API, no una cámara en vivo. Las teselas inmutables se almacenan temporalmente para evitar descargas repetidas. Un fallo del mapa se indica sin sustituirlo por otra región.
- Cambiar ubicación cambia terreno y geometría. Las crisis DONKI se asignan automáticamente; no hay selector de desastres.
- Horizons se consulta para el calendario de entrenamiento **17 mayo–10 junio de 2024**, con muestras cada cuatro días; una octava muestra del 14 junio permite animar el último turno. Conserva los tres turnos diurnos y cuatro nocturnos de la misión. Son cálculos obtenidos por API para esas fechas, no posiciones de hoy.
- Observador `coord@301`, longitud positiva al este, altitud de referencia 0 km; elevación/azimut aparentes sin atmósfera. Consultas originales enlazadas en pantalla. Sin sombras de montañas.
- Paneles: ajustas elevación de la normal; azimut automático. Generación depende del error de orientación y salud del panel; seguimiento automático cuesta 4 energía por turno.
- Antena: ajustas elevación, azimut automático. La Tierra recorre un arco elíptico de izquierda a derecha en ciclos de 28 segundos. Sale completamente del borde derecho y reaparece por la izquierda sin invertir dirección; al reaparecer, reinicia el tiempo de seguimiento. Es una **trayectoria de entrenamiento**, no el movimiento real de la Tierra vista desde la base lunar. Se mantiene el error residual de seguimiento al guardar respecto al objetivo del turno.
- Antena con ratón/táctil: mantén pulsado y arrastra; al soltar conserva dirección. Flechas también funcionan. Alineación durante **4 segundos**; después se congela la vista para guardar sin mover la antena accidentalmente. Guardar cuesta una acción; cancelar no gasta.

DONKI utiliza observaciones recientes recreadas en el calendario de entrenamiento. No se afirma que las dos fechas coincidan. El guardado conserva los datos usados por esa expedición; refrescar APIs no cambia una partida en curso.

### Fallos de conexión

El modo normal **no carga automáticamente la copia local**. Si falla la consulta inicial, se bloquea iniciar hasta reintentar o elegir explícitamente **Modo sin conexión (archivo 2024)**. Este modo conserva los dos eventos históricos y un mapa global, claramente identificados como archivo. Si falla una actualización después de una consulta exitosa, se informa y se conserva la selección anterior con su fecha.

Las partidas antiguas mantienen sus reglas. Para usar la integración nueva, inicia una expedición nueva. Un alojamiento estático solo permite elegir el modo de archivo: para APIs necesita ejecutar `server.cjs` y sus rutas. No publiques `.env`.

## Controles y objetivo

WASD/flechas: moverte. E: consola. 1–4: tripulante. Esc: menú. Modo individual con cambio de personaje y modo cooperativo de hasta cuatro sesiones. La conexión pública del modo cooperativo requiere configurar Firebase; consulta MULTIPLAYER.md.

Sobrevive siete turnos con oxígeno, agua, alimentos y seguridad positivos; consigue 60 ciencia, motor 100%, 50 datos entregados, informe enviado y rescate confirmado. Tienes cuatro acciones por turno (cinco con moral ≥85) y tres CPU. Laboratorio produce ciencia y datos; telecom entrega datos sin borrar ciencia. Las primeras dos misiones de Tierra proporcionan presupuesto para rescate. Recepción óptima en turnos 2/4/6, con antena alineada y sin crisis; son horarios asignados, no ocultaciones terrestres.

Soporte vital recicla aire y extrae agua usando energía; investiga volátiles para mejorar extracción. Cultivos requieren siembra, riego separado y luz. El radar de humedad permite regar tres zonas secas: confirmar cuesta 6 agua, 2 energía y una acción, y proporciona humedad para dos turnos de crecimiento. Refugios, reparaciones y motor compiten por materiales. Baterías sostienen servicios nocturnos. El pronóstico de cierre muestra consumos y consecuencias antes de confirmar.

## Verificación y archivos

`npm test`: reglas originales, recorridos ganadores en ambas ubicaciones y clases C/M/X, respuesta DONKI vacía, error de conexión sin reemplazo silencioso, protección de clave, migración 404, programación sorpresa persistente, ausencia de avisos anticipados y movimiento visible.

`npm run test:browser` desde lunar-guardians: Playwright con Edge instalado, servidor temporal 18765. Comprueba conexión real, evidencia DONKI, mapas distintos, Tierra visiblemente móvil, dos alertas sorpresa, cuatro segundos, soltar puntero, costo único, cancelar, guardado, fallo de red y archivo explícito. Requiere internet y `npm install` para las dependencias de desarrollo.

`dist/engine.js`: reglas. `game.js`: juego y guardado. `minigames.js`: riego/antena. `nasa-ui.js`: preparación y evidencia. `nasa-service.cjs`: APIs del servidor. `nasa-snapshot.*`: archivo para modo sin conexión explícito. `sources.js`, `guia-extraida.txt`: referencias originales de la guía. `server.cjs`: servidor local. `app.js` y `style.css` corresponden a la versión antigua y no se cargan.


## Publicar actualizaciones en Netlify

Sitio vinculado: https://superb-travesseiro-23b15a.netlify.app/

El juego se sirve desde `dist`. Las cuatro rutas `/api/nasa`, `/api/nasa/audit`, `/api/moon-tile` y `/api/science` se ejecutan en `netlify/functions/nasa.mjs`, reutilizando `nasa-service.cjs`. No dependen de que tu computadora esté encendida. `npm start` conserva el funcionamiento local.

Desde la raíz NASA SPEACE o desde lunar-guardians:

```powershell
npm run deploy:preview
```

Comprueba la URL de prueba. Para actualizar el enlace público:

```powershell
npm run deploy
```

Netlify CLI compila y sube el juego y sus funciones. No arrastres únicamente `dist` al panel: eso no publica estas funciones. El sitio está vinculado localmente en `.netlify/state.json` (no se comparte por Git). En otra computadora, instala dependencias dentro de lunar-guardians, ejecuta `npx netlify login` y `npx netlify link --name superb-travesseiro-23b15a` con una cuenta que tenga acceso.

`NASA_API_KEY` está configurada en Netlify como variable privada para producción y vistas previas. Cambiar el `.env` local no actualiza automáticamente esa variable: cámbiala en Environment variables del proyecto Netlify y vuelve a desplegar. No pegues la clave en `netlify.toml` ni en `dist`.

La pasarela api.nasa.gov puede responder 404; el servicio consulta entonces la API oficial de CCMC y lo informa en la evidencia. No sustituye errores de red por archivos locales.

Las peticiones DONKI/Horizons tienen un límite de 8 segundos para que el conjunto de consultas permanezca dentro del tiempo de una función síncrona. Si hay un error, reintenta desde la preparación de misión.

En Netlify, `/api/nasa/audit` solo puede devolver la última consulta de la instancia que atienda la petición: una instancia nueva devuelve 404 informativo. La evidencia completa y fiable de cada misión viaja en `/api/nasa` y queda guardada en el juego, sin depender de esa memoria temporal.

Verificación adicional: `node netlify-tests.cjs` prueba el adaptador. `node verify-public.cjs https://TU-SITIO.netlify.app` comprueba el despliegue real con Edge, NASA, mapas y que `.env` y los archivos del servidor no sean públicos.


## Diviner y OSDR: datos consultados y mecánicas

Inicia una **nueva expedición** para incorporar estas fuentes. Las partidas anteriores mantienen sus reglas y no se modifican al reconectar. En «Preparar misión» se muestra el estado de cada servicio; en «Entorno y conexión NASA» están los enlaces, fecha, curva térmica y protocolo.

`GET /api/science` consulta ambos servicios públicos en paralelo, con un máximo de 12 segundos por petición. No necesitan otra API key: `NASA_API_KEY` sigue solo en `.env` local / variables privadas de Netlify para DONKI. Las peticiones simultáneas se agrupan, pero no se sustituye una consulta fallida por una copia anterior. Un fallo parcial conserva el servicio que sí respondió y muestra el otro como no disponible. Los datos de cada expedición se guardan para reproducir sus reglas.

### Diviner

Fuente: PDS Geosciences, producto `LRO-L-DLRE-5-GCP-V1.0`, tabla `global_cumul_avg_cyl_00n10n_002.tab`. Se leen mediante HTTP Range/206 las 96 filas de cada celda de 0.5° (23.25° E / 0.75° N y 30.25° E / 5.25° N), validando coordenadas, tamaño y orden. Se ignoran temperaturas bolométricas no válidas, incluido -9999; no se descargan los 156 MB del archivo. Datos de julio de 2009 a abril de 2015, medias por intervalo de 0.25 horas solares locales. Son temperaturas de **superficie**, no aire ni telemetría actual.

En **Soporte vital**: control automático (22 °C, o temperatura OSDR al usar su protocolo), ahorro (16 °C), apagado y aislamiento (12 materiales, 2 piezas, 4 energía, 1 acción). Energía compartida: bombas → control térmico → reciclador → cultivos. Aislamiento reduce 35% la demanda antes de redondear.

Modelo pedagógico: superficie estimada = mínimo Diviner + (máximo − mínimo) × sin(elevación solar positiva)^0.25. De noche usa el mínimo observado. No es una predicción térmica validada. Costo térmico = diferencia con consigna / 18 (calefacción) o / 35 (refrigeración), con factores de aislamiento y ahorro, redondeado hacia arriba. Sin energía o apagado, la cabina cambia hasta 8 °C por turno hacia la superficie. Fuera de 12–30 °C: cultivos detenidos, −12 seguridad y −6 moral. Estos umbrales y costos son reglas del juego. Sin Diviner, sigue la calefacción clásica de 14 energía nocturna, avisada expresamente.

### OSDR

API `https://visualization.osdr.nasa.gov/biodata/api/v2/`: metadatos de `dataset/OSD-267/` y consulta CSV de condiciones de sus ensayos. Experimento **VEG-01A**, lechuga en la ISS, microbiología/nutrición y comparación con controles terrestres. Se extraen y validan unidades de la muestra de vuelo: 16 h luz / 8 h oscuridad, 200 µmol/m²/s, temperatura media registrada 23.25 °C y cosecha a 33 días. Es una referencia experimental, no prueba de rendimientos lunares ni de temperatura óptima universal.

En **Invernadero**: siembra lechuga o experimento y elige «Aplicar protocolo OSD-267». Consume ceil(8 × horas de luz / 24) energía por turno (6 con el protocolo actual), crece un paso y requiere riego. Para validar el experimento, completa dos turnos de crecimiento con ese protocolo y cabina a ±3 °C de la temperatura registrada. El experimento sigue tardando tres pasos de crecimiento: duración comprimida para la partida. Cosecharlo validado da 26 ciencia/datos base +10 adicionales y desbloquea riego por 5 agua en lugar de 6. Bonificación y ahorro son efectos simulados; no resultados medidos por NASA. El modo térmico ahorro permite crecimiento, pero no valida la réplica a 23.25 °C.

`science-tests.cjs` cubre el formato PDS/CSV, valores ausentes, unidades erróneas, fallos parciales, energía compartida, condiciones del experimento, recompensas, persistencia y victoria con las nuevas reglas. Las pruebas de navegador comprueban también el riego, las consolas y la evidencia científica.


## Operaciones interactivas de la base

Cuatro decisiones abren ahora procedimientos en `dist/operations.js`, sin cambiar sus costos ni recompensas:

- **Energía → Instalar batería:** acoplar la unidad, conectar +/+ y −/−, probar continuidad. Añade 35 de capacidad vacía; cargarla sigue siendo otra decisión.
- **Refugio → Reparar motor:** inspeccionar presión por sección, sustituir la junta defectuosa y equilibrar dos válvulas dentro de la tolerancia indicada. Confirmar repara 50% del motor.
- **Laboratorio → Analizar suelo:** explorar una bandeja, seleccionar tres lecturas claras y comparar sus patrones con referencias didácticas. Confirmar entrega 20 ciencia y 20 datos; consume energía, CPU y acción. Los patrones son simulados, no espectros NASA.
- **Soporte vital → Reparar reciclador:** identificar el filtro obstruido, sustituirlo y rotar seis conductos para restablecer el recorrido de aire. Confirmar recupera hasta 30 puntos de eficiencia, respetando el límite de 100% y los descuentos del taller.

Los procedimientos admiten ratón, táctil y teclado. No tienen penalización por errores: se corrigen antes de confirmar. Cancelar o cerrar descarta el intento sin consumir recursos. Los costos se aplican una vez al confirmar; se revalidan misión, turno y recursos. Los progresos incompletos no se guardan; las operaciones confirmadas usan el guardado existente. La antena y el riego conservan sus minijuegos. Modos, construcciones y las demás decisiones mantienen su funcionamiento.

Ejecuta `npm run test:operations` para comprobar los cuatro recorridos completos en Edge, intentos incorrectos, cancelación, confirmación única, recursos insuficientes, controles de teclado, descuento del taller y disposición móvil.


## Salas cooperativas

Consulta [MULTIPLAYER.md](MULTIPLAYER.md) para probar cuatro jugadores en pestañas locales y vincular Firebase con Netlify. Sin un proyecto Firebase configurado, las salas públicas permanecen deshabilitadas; no se sustituyen por una conexión ficticia.

## Arte de la versión del compañero

El diseño se reutiliza desde `art-source/PixelArtGenerator.ts` (copia del original) y `art-source/CharacterArt.ts` (funciones de dibujo de SpriteRegistry). `build.cjs` genera las adaptaciones Canvas sin añadir Phaser al motor actual. `dist/cozy.js` monta el diorama original de MainMenuScene, las texturas, ventanas e iluminación; `dist/cozy.css` traslada la paleta, tipografía y paneles del CSS original; `dist/cozy-ui.js` organiza el HUD compacto. El mapa y los puntos de interacción mantienen las coordenadas del sistema compartido. `node cozy-visual-tests.cjs` genera capturas de menú, base, módulo y móvil.

### Ajustes de exploración y legibilidad

Zoom inicial 2.4, placas en todas las entradas, esclusa iluminada y suelo gris alrededor de la base. El HUD muestra iconos pixel, salud y oxígeno del traje; se retiró el selector de cuatro personajes de la pantalla. Las ventanas de los módulos tienen ilustraciones y costos iniciales explícitos, incluidos los ajustes sin gasto inmediato. No existe contador ni presupuesto de acciones en las partidas de tiempo continuo.

Rover: disponible en el exterior desde el inicio, E o R para subir/bajar; velocidad 300 frente a 85 a pie, con batería compartida y recarga en el hangar. Las zonas de radiación anuncian su activación y causan daño directo mientras el astronauta está dentro. Refugio → Reforzar traje EVA cuesta 12 materiales, 2 piezas y 6 energía; reduce 50% la exposición y el daño exterior para la tripulación. Son efectos de juego, no protección ni dosis reales.

## Estado personal y misión compartida

El panel superior representa reservas generales de energía, alimentos, oxígeno de la base, agua, seguridad, ciencia y un índice ambiental de radiación común (simulado). Materiales, piezas, hielo y mineral se muestran debajo. El panel inferior de cada jugador tiene diez corazones, diez iconos de comida y diez tanques de oxígeno; cada icono representa diez puntos y admite llenado parcial.

Caminar consume alimentación (0.18 puntos/s en base, 0.24 en exterior); conducir consume menos (0.035 puntos/s). Estar quieto no consume alimentación. Con alimentación a cero se pierde salud. Dormitorio cura 30 salud; Cultivos permite comer con F: −5 alimentos compartidos, +35 alimentación personal. La reserva alimentaria vacía no termina instantáneamente una misión si la tripulación aún está alimentada.

El traje tiene 20 segundos de ahorro antes de gastar el tanque en el exterior. Al agotarlo pierde 0.4 puntos/s de oxígeno (menos con mejoras/rover); sin oxígeno ni ahorro pierde salud. En la base se recargan tanque y ahorro usando soporte vital; entrar y salir no reinicia gratis los 20 segundos. Las tormentas dañan a los expuestos; los valores personales se calculan en servidor en multijugador. A cero salud hay evacuación médica con penalización de moral.

Cada plaza multijugador recibe una misión distinta al visitar el Centro de Mando: hielo, baliza, minerales o volátiles. E recoge el objetivo exterior; para entregar hay que volver a esa consola. Cada entrega concede una sola vez 15 ciencia, 15 datos y 5 materiales compartidos. Asignaciones y progreso se conservan al reconectar. En individual se conserva la campaña de dos expediciones. El fondo ambiental está fijo; los actores y la cámara siguen funcionando. Los minijuegos adoptan el estilo pixel excepto la antena, cuyo diseño se conserva.


### Supervivencia continua (15 noviembre 2026)
- Días de 180 segundos, sin final automático en el día 7 ni al confirmar el rescate. El rescate es un hito opcional. Cada 3 días aumenta el consumo y el daño; después aparecen más áreas de radiación.
- El oxígeno, agua, alimentos y seguridad de la base son esenciales; su agotamiento, o energía y reserva ambas vacías, termina la partida. Cero corazones elimina al astronauta sin revivirlo; en una sala puede observar a los supervivientes.
- Centro de Mando → misión personal → recoger polvo/roca con E → Laboratorio: Depositar muestras → minijuego Analizar suelo. Cada muestra da 20 ciencia/datos, 8 materiales, 2 piezas y 4 seguridad; también material analizado para el taller. Después solicita otra misión. Los afloramientos libres vuelven a estar disponibles al cambiar de día.
- Batería auxiliar precargada: instalación única, +35 energía (excedente a reserva) y +35 capacidad. Los paneles siguen siendo la fuente renovable; orientarlos o activar seguimiento aumenta la captación diurna.
- Menú de pausa → Guardar y menú principal conserva las salas Firebase. Tripulación en línea → Unirme recupera la última sala y el astronauta usando el mismo navegador y su autenticación anónima. Validez: 30 días desde la última actividad. Sin nadie conectado, el reloj se detiene. Abandonar sala libera la plaza y descarta ese personaje. JUGAR individual sigue guardando localmente; para guardar en la nube, crea una sala, incluso si juegas solo. No hace falta dejar encendida la computadora del creador.
- La cámara permanece fija dentro de cada sector y cambia de vista al cruzar su borde. El suelo decorativo no se desplaza. Menú con distribución vertical adaptable.
- Las siete fases astronómicas de referencia se reutilizan como ciclo de simulación, incluidos los eventos documentados. No se presentan como nuevas mediciones NASA ni como predicción del futuro.
