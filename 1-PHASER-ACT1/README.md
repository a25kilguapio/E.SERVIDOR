# Fase 1 - PoC Vue 3 + Phaser 4

Entregable de la Fase 1: el component Vue i el Game Loop de Phaser. L'enunciat és a les diapositives (`Tutorial_Fase1_Vue3_Phaser4_v2`) i aquí deixo tot el que he anat fent per completar-lo.

## De què va

L'objectiu era aprendre a encapsular un llenç de Phaser 4 dins del cicle de vida d'un component de Vue 3, sense liar-ho encara amb Tiled, teclat ni WebRTC (això serà a fases posteriors). Bàsicament: que Phaser visqui i mori quan el component es munta i es desmunta, i que les dades vagin de Vue cap a Phaser per props + watch().

## Estructura del projecte

El projecte entregable és `poc-fase1-vue-phaser/`, creat amb `npm create vite@latest poc-fase1-vue-phaser -- --template vue` i amb `phaser` instal·lat com a dependència.

- `src/App.vue` - tota la part HTML/CSS: l'input del nom, el selector de color, el desplegable d'estat i els botons. No sap res de Phaser, només passa dades cap avall per props.
- `src/components/PhaserCanvas.vue` - el component pont. Munta la instància de `Phaser.Game` a `onMounted()` i la destrueix a `onUnmounted()` amb `game.destroy(true)` perquè no quedi cap fuita de memòria quan s'amaga el llenç.
- `src/game/MainScene.js` - l'escena de Phaser en JS pur: dibuixa l'avatar (un cercle) i el nom, i al `update()` els fa oscil·lar perquè es vegi que el bucle va a 60 FPS.

Vaig treure els components de mostra que porta Vite per defecte (HelloWorld, TheWelcome, el logo...) perquè no pintaven res aquí, i també vaig eliminar una carpeta `components/` que havia quedat mal ubicada a l'arrel del projecte en comptes de dins de `src/`.

## Com es comuniquen Vue i Phaser

1. `App.vue` guarda l'estat (nom, color, estat) en variables reactives i les passa a `<PhaserCanvas>` com a props.
2. `PhaserCanvas.vue` rep les props amb `defineProps()` i les observa amb `watch()`. Cada canvi crida un mètode de l'escena activa (`game.scene.getScene('MainScene')`).
3. `MainScene.js` exposa mètodes públics (`actualitzarNom`, `canviarColor`, `actualitzarEstat`) que Phaser utilitza per modificar els objectes del canvas sense reiniciar l'escena.

Hi ha un detall important: quan s'amaga el joc i es torna a mostrar, cal tornar a sincronitzar les dades actuals perquè l'escena comença de zero. Per això, un cop `onMounted()` crea la partida, s'escolta l'event `ready` de Phaser i es passen els valors actuals (nom, color, estat) abans de res.

## El repte de les 3 ampliacions

A banda del que demanava el tutorial pas a pas, vaig fer les tres petites millores que proposava el repte final:

1. **Selector de color de l'avatar**: un `<input type="color">` a `App.vue`, una prop nova `:colorAvatar` i un segon `watch()` a `PhaserCanvas.vue`. Com que l'input retorna un string tipus `#ff0000`, el converteixo a número amb `parseInt(hex.replace('#',''), 16)` abans de passar-lo a `setFillStyle()`.
2. **Indicador d'estat**: un `<select>` amb Disponible / Ocupat / Absent, que es mostra com un segon text sota el nom i es manté enganxat a l'avatar dins de l'`update()`.
3. **Pausa del Game Loop**: un botó que crida `escena.scene.pause()` o `resume()` depenent de si ja estava pausada. Ho vaig exposar des de `PhaserCanvas.vue` amb `defineExpose()` i ho controlo des de `App.vue` amb una referència al component.

## Com s'executa

```bash
cd poc-fase1-vue-phaser
npm install
npm run dev
```

I s'obre a `http://localhost:5173`.

## Comprovacions fetes

- El cercle i el nom oscil·len sols a 60 FPS des que carrega la pàgina.
- Si escrius un altre nom, canvies el color o canvies l'estat, es veu el canvi a l'instant dins del canvas.
- Clicant "Amaga el llenç" desapareix el `<canvas>` del DOM i no queda cap error a la consola (he comprovat amb les DevTools que passa de 1 a 0 elements `<canvas>`).
- Si canvies el nom amb el joc amagat i el tornes a mostrar, apareix un sol canvas amb les dades actualitzades, no es dupliquen instàncies de Phaser.
- El botó de pausa congela l'oscil·lació de l'avatar i, en tornar a prémer, continua des d'on l'havia deixat.

## Entrega

Carpeta `poc-fase1-vue-phaser/` sense `node_modules` (ja està al `.gitignore`), pujada al repositori.
