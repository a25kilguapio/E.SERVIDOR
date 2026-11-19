# Fase 2 - Mapes 2D amb Tiled + Phaser 4

Segona PoC entregable: carregar un mapa fet a Tiled Map Editor dins de Phaser 4 i mostrar-ne els objectes a Vue 3.

## Com funciona

El mapa es dissenya fora del codi, a Tiled, i s'exporta a `mapa.json`. Phaser el llegeix i el pinta a `MapScene.js`, i quan acaba de processar la capa d'objectes envia la llista de sales i monitors cap a Vue perquè els mostri en una barra lateral. La idea és no tocar JavaScript per canviar l'escenari: tot el disseny visual va a Tiled.

## Estructura

- `public/assets/mapa.tmx` / `mapa.json` - el mapa fet a Tiled, 20x15 rajoles de 32x32px (mida real que demana l'enunciat).
- `public/assets/office/` - els tilesets de suelo i paret, més els fulls d'sprites dels mobles, tots del pack *Office Pixel Art* (veure Crèdits).
- `src/game/MapScene.js` - carrega els tilesets i el JSON, pinta les capes Terra / Parets, i llegeix la capa d'Objectes (spawn, zones, monitors i mobles).
- `src/components/PhaserCanvas.vue` - component pont de 640x480 amb `pixelArt: true`, reenvia l'esdeveniment `mapa-carregat` a App.vue.
- `src/App.vue` - el canvas a l'esquerra i la llista d'objectes del mapa a la dreta.

## El mapa a Tiled

- Capes de rajoles: `Terra` (moqueta grisa) i `Parets` (paret d'oficina), separades tal com demana l'enunciat. Hi ha també una capa `Mobles` buida que no faig servir (els mobles van com a objectes, veure sota).
- Als murs de `Parets` els he posat la propietat personalitzada `collides=true` directament al tile dins del tileset, perquè `MapScene.js` pugui activar-la amb `setCollisionByProperty`.
- Capa d'objectes `Objectes`: un `spawn`, dues `zona` (`nomSala` + `aforament`) i dos `monitor` (`titol`) - això és el que es llegeix i es mostra al panell de Vue.
- Els mobles (escriptori, cadira, ordinador, arxivador, planta, rellotge) també són objectes de Tiled, no rajoles: com que els sprites del pack no són d'una mida uniforme (hi ha peces més altes que una rajola), no encaixaven en una graella normal. Cada objecte-moble porta unes propietats `atles` i `frame` que diuen quin sprite li toca, i `gx`/`gy` amb la posició real a la graella (la `x`/`y` normal de l'objecte només serveix perquè Tiled el pugui ensenyar bé a l'editor, Phaser fa servir `gx`/`gy`).

## Com s'executa

```bash
cd poc-fase2-tiled
npm install
npm run dev
```

## Comprovacions fetes

- El mapa carrega bé a `http://localhost:5173`: es veu el suelo, les parets, i els mobles de cada sala.
- El cercle verd de l'avatar apareix al punt de spawn.
- El panell lateral de Vue llista les 2 sales amb el seu aforament i els 2 monitors.
- Obrint `public/assets/mapa.tmx` amb el Tiled Map Editor es veu el mateix disseny, mobles inclosos.

## Crèdits

Els assets d'oficina són del pack gratuït *Office Pixel Art* d'Imersa Studios: https://imersastudios.itch.io/office-pixel-art
