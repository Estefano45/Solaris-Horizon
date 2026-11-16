# Multijugador en tiempo continuo — actualización

La versión actual reemplaza la votación para terminar turnos: el servidor calcula fases de 110 segundos y sincroniza recursos, misiones y exposición personal. Todos pueden usar cualquier módulo; el nombre se introduce antes de crear o entrar a una sala. Las decisiones conservan reservas de módulos y se validan en servidor. Los procedimientos pueden terminar después de un cambio de fase si quedan recursos.

Entrar/salir de la base, recoger muestras, fabricar y manejar el rover usan comandos de expedición validados. Un solo astronauta puede conducir el rover compartido. La radiación y el oxígeno del traje son personales; ciencia, alimentos, energía, motor y rescate son comunes. Para reconectar usa el mismo navegador/sesión y el código de sala.

Pruebas: `npm run test:multiplayer`. Para verificar el sitio publicado con cinco sesiones aisladas (cuatro admitidas), usa PowerShell:

```powershell
$env:TEST_URL='https://superb-travesseiro-23b15a.netlify.app'
node realtime-browser-tests.cjs
Remove-Item Env:TEST_URL
```

El test selecciona explícitamente el catálogo sin conexión para obtener una misión reproducible; `node verify-public.cjs https://superb-travesseiro-23b15a.netlify.app` verifica por separado las APIs NASA en vivo.

---
## Referencia de configuración inicial (el flujo antiguo por turnos fue reemplazado)

# Multijugador de Lunar Guardians

## Estado

Implementado y verificado el 15 de noviembre de 2026 con cuatro sesiones independientes sobre el enlace público de Netlify y Firebase real. La integración usa Firebase Authentication anónimo, Realtime Database y Netlify Functions. **El proyecto solaris-horizon ya está vinculado y las salas públicas están habilitadas.** El juego individual sigue funcionando. No se han creado cuentas ni activado facturación.

## Probar ahora en VS Code

1. Dentro de `lunar-guardians`, ejecuta `npm install`, `npm run build` y `npm start`. Reinicia un servidor que estuviera abierto antes de esta actualización.
2. Abre `http://127.0.0.1:8765`. Prepara una misión NASA o elige expresamente el archivo sin conexión.
3. Pulsa **Tripulación en línea → Crear sala**. Copia el código de seis caracteres.
4. Abre hasta tres pestañas nuevas escribiendo la dirección (no dupliques la pestaña, porque algunos navegadores copian sessionStorage), o usa ventanas/perfiles distintos. Entra con **Unirme** y el código.
5. Cualquier integrante puede iniciar. Cada uno recibe un personaje distinto y puede usar cualquier módulo.

En desarrollo sin Firebase se usa un servidor de salas en memoria y actualización cada 500 ms. Sirve para probar en este equipo, no conecta amigos remotos ni persiste tras reiniciar `npm start`. No se presenta como conexión Firebase.

## Activar Firebase y el enlace público

1. En https://console.firebase.google.com/ crea un proyecto y registra una aplicación **Web**. Analytics no es necesario para el juego.
2. En **Authentication → Sign-in method**, activa **Anonymous**. Añade `superb-travesseiro-23b15a.netlify.app` a dominios autorizados cuando corresponda.
3. Crea una **Realtime Database** (no Firestore). Comienza con acceso restringido. Copia su URL `https://...firebasedatabase.app` o `https://...firebaseio.com`.
4. En la pestaña **Rules** de esa base, publica el contenido de `firebase.database.rules.json`. Solo miembros autenticados leen su sala. Ningún navegador escribe directamente; Netlify valida todas las acciones. No uses reglas públicas de prueba.
5. Crea `firebase-web-config.json` en `lunar-guardians`, con el objeto de configuración web en **JSON válido**: `apiKey`, `authDomain`, `projectId`, `databaseURL`, `appId` y los demás campos que Firebase proporcione. No incluyas `const firebaseConfig =` ni comentarios. Esa configuración identifica la aplicación y será pública; no contiene la cuenta de servicio.
6. En **Configuración del proyecto → Cuentas de servicio**, genera una clave privada para el SDK Admin. Guarda el JSON como `.firebase-service-account.json`, también en `lunar-guardians`, **fuera de dist**. No lo pegues en el chat, no lo subas a Git ni lo compartas con tus amigos.
7. Ejecuta `npm run firebase:configure`. Valida que ambos archivos sean del mismo proyecto y configura `.env` sin imprimir secretos. Reinicia el servidor para probar Firebase desde localhost.
8. Publica las variables privadas en el sitio Netlify ya vinculado: `npx netlify env:import .firebase-netlify.env`, luego `npm run deploy`. El archivo temporal contiene secretos: queda ignorado por Git y nunca debe copiarse a `dist`.
9. Prueba el enlace con dos dispositivos: crear, unirse, completar un minijuego, cerrar un turno y reconectar. La conexión real Firebase no puede verificarse hasta disponer de este proyecto.

Firebase tiene cuotas y límites de uso; no se garantiza uso ilimitado gratuito. Revisa el consumo de Realtime Database, Authentication y Netlify Functions antes de difundirlo ampliamente. El servidor envía presencia cada cinco segundos y movimiento hasta dos veces por segundo; los clientes Firebase escuchan cambios con `onValue`.

## Reglas cooperativas

- Hasta cuatro identidades por sala, con personajes exclusivos. Sin profesiones ni permisos diferentes.
- Una reserva común de energía, piezas, agua, materiales, CPU y acciones. Se conservan las cuatro acciones por turno del modo individual; no se multiplican por cuatro.
- Cada módulo admite un procedimiento a la vez. Otros jugadores pueden trabajar simultáneamente en módulos diferentes. Al confirmar, el servidor vuelve a comprobar los recursos; si otro procedimiento agotó la energía, no aplica costos parciales.
- Cancelar libera el módulo. El servidor comprueba pertenencia, turno, reserva y costos, y evita repetir una solicitud confirmada. Los minijuegos son cooperativos: no se certifica en el servidor que un cliente modificado haya ejecutado cada interacción visual.
- Para avanzar, todos los conectados marcan **Listo** y no puede haber procedimientos abiertos. Una decisión nueva retira las confirmaciones previas.
- Tras 25 segundos sin presencia, un desconectado deja de bloquear el cierre. Su personaje queda reservado para reconectar con la misma sesión del navegador. Salir expresamente libera la plaza; cerrar la pestaña conserva la plaza. Al borrar los datos de sesión se pierde esa identidad anónima.
- Las salas caducan a las 24 horas. Las credenciales no se guardan en la partida individual. Las salas caducadas de Firebase deben eliminarse desde la consola; el vencimiento restringe el acceso pero no borra automáticamente datos almacenados.
- Las posiciones recibidas del servidor muestran a los compañeros en el mapa; el movimiento es cooperativo casual, no una simulación competitiva de alta frecuencia.
- La misión utiliza una única consulta NASA preparada por el servidor, con un mismo calendario y unas mismas crisis para todos. Los datos quedan guardados con la sala.

## Archivos y pruebas

`multiplayer-core.cjs`: reglas cooperativas y reducción determinista de comandos. `multiplayer-service.cjs`: autenticación y transacciones Firebase o almacenamiento local. `netlify/functions/multiplayer.mjs`: API. `dist/multiplayer.js`: salas, sincronización y adaptación de minijuegos. `firebase-client-src.js`: SDK web empaquetado por `npm run build`.

`npm run test:multiplayer` prueba reglas y cinco sesiones de Edge: cuatro admitidas, quinto rechazado, exclusión de módulo, minijuego real sincronizado, recursos compartidos, movimiento, cierre conjunto y reconexión. `npm test`, `npm run test:operations` y `npm run test:browser` cubren las regresiones del juego individual.

Documentación oficial: https://firebase.google.com/docs/database/web/read-and-write · https://firebase.google.com/docs/database/security · https://firebase.google.com/docs/auth/web/anonymous-auth


## Verificación pública realizada

`node multiplayer-public-tests.cjs` confirmó cuatro personajes exclusivos, rechazo del quinto jugador, reserva de módulo, análisis de suelo sincronizado, recursos compartidos, posiciones remotas, cierre unánime y reconexión tras recargar. Usa una misión de archivo elegida explícitamente para aislar la prueba multijugador; `verify-public.cjs` verificó por separado las conexiones NASA.

Netlify usa `AWS_LAMBDA_JS_RUNTIME=nodejs22.x`. Firebase Admin 13.6.x y sus dependencias se incluyen externamente en las funciones; los módulos Admin se importan desde el punto de entrada ESM. Esto evita el fallo de empaquetado y la incompatibilidad de jwks-rsa/jose de la versión 14.5.1 en este alojamiento. No se requiere NODE_OPTIONS experimental.
