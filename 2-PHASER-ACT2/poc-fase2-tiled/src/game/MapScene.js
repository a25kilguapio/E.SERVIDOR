import Phaser from 'phaser';

export class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene');
  }

  // 1. PRELOAD: Vite serveix la carpeta public/ des de l'arrel '/'
  preload() {
    this.load.image('tiles_terra', '/assets/office/office_floors_tileset.png');
    this.load.image('tiles_parets', '/assets/office/office_walls_tileset.png');
    this.load.tilemapTiledJSON('mapa_oficina', '/assets/mapa.json'); // Clau interna 'mapa_oficina'

    // [NOU] Repte 2: mobles d'oficina reals (pack Office_Pixel_Art), carregats com a atles manuals
    this.ATLES_MOBLES = ['desks', 'seating', 'tech', 'storage', 'decor'];
    this.ATLES_MOBLES.forEach((nom) => {
      this.load.image(`props_${nom}`, `/assets/office/props_${nom}.png`);
      this.load.json(`atles_${nom}`, `/assets/office/props_${nom}.json`);
    });
  }

  // 2. CREATE: construïm el mapa i pintem les capes en ordre (de baix a dalt)
  create() {
    const map = this.make.tilemap({ key: 'mapa_oficina' });

    // Dos tilesets independents (abans n'hi havia un de sol): suelo i parets del pack d'oficina
    const tilesetTerra = map.addTilesetImage('office_floors', 'tiles_terra');
    const tilesetParets = map.addTilesetImage('office_walls_tileset', 'tiles_parets');
    if (!tilesetTerra || !tilesetParets) {
      console.error('Error: revisa els noms dels tilesets office_floors / office_walls_tileset');
      return;
    }
    const totsElsTilesets = [tilesetTerra, tilesetParets];

    // Creem les capes de rajoles amb el nom exacte que tenen a Tiled
    map.createLayer('Terra', totsElsTilesets, 0, 0);

    const capaParets = map.createLayer('Parets', totsElsTilesets, 0, 0);

    // Deixem activades les col·lisions de paret per aprofitar-les a la Fase 3
    capaParets?.setCollisionByProperty({ collides: true });

    // Registrem els "frames" de cada atles de mobles a partir del seu JSON
    const atlesMobles = {};
    this.ATLES_MOBLES.forEach((nom) => {
      atlesMobles[nom] = this.cache.json.get(`atles_${nom}`);
    });

    // Llegim la capa d'objectes 'Objectes' definida a Tiled
    const capaObjectes = map.getObjectLayer('Objectes');
    const elementsDetectats = []; // Llista per enviar a Vue en acabar el bucle

    // Ordenem per 'y' per simular profunditat: el que està més avall es dibuixa per sobre
    // (als mobles fem servir 'gy', ja que la seva 'y' segueix el conveni de Tiled per ensenyar-los a l'editor)
    const yPerOrdenar = (obj) => {
      const props = this.obtenirPropietats(obj);
      return props.tipus === 'moble' ? props.gy : obj.y;
    };
    const objectesOrdenats = [...(capaObjectes?.objects || [])].sort((a, b) => yPerOrdenar(a) - yPerOrdenar(b));

    objectesOrdenats.forEach((obj) => {
      const props = this.obtenirPropietats(obj); // Converteix [{name,value}] -> {clau: valor}

      // Tiled dona (x, y) a dalt a l'esquerra; sumem la meitat per trobar el centre
      const cx = obj.x + (obj.width || 0) / 2;
      const cy = obj.y + (obj.height || 0) / 2;

      if (props.tipus === 'spawn') {
        // Col·loquem l'avatar al punt d'aparició
        this.avatar = this.add.circle(cx, cy, 14, 0x10b981).setStrokeStyle(2, 0xffffff);
      }

      // Si és una sala de reunions, dibuixem un rectangle semitransparent i el nom
      if (props.tipus === 'zona') {
        this.add
          .rectangle(cx, cy, obj.width, obj.height, 0x10b981, 0.22)
          .setStrokeStyle(2, 0x10b981);
        this.add
          .text(cx, cy, props.nomSala || 'Zona', { fontSize: '13px', color: '#a7f3d0' })
          .setOrigin(0.5);
        elementsDetectats.push({
          tipus: 'Zona',
          nom: props.nomSala || 'Sense nom',
          // [NOU] Repte 3: aforament llegit de la Custom Property de Tiled
          aforament: props.aforament || 0,
        });
      }

      // Si és un monitor, dibuixem una icona de pantalla i el seu títol
      if (props.tipus === 'monitor') {
        this.add.rectangle(cx, cy, 28, 20, 0xf59e0b).setStrokeStyle(2, 0xffffff);
        this.add
          .text(cx, cy - 18, props.titol || 'Monitor', { fontSize: '12px', color: '#fde68a' })
          .setOrigin(0.5);
        elementsDetectats.push({ tipus: 'Monitor', nom: props.titol || 'Pantalla' });
      }

      // [NOU] Repte 2: moble d'oficina real, retallat del seu atles amb l'ancoratge del JSON
      if (props.tipus === 'moble') {
        const info = atlesMobles[props.atles]?.frames[props.frame];
        const clauTextura = `props_${props.atles}`;
        if (info) {
          const textura = this.textures.get(clauTextura);
          if (!textura.has(props.frame)) {
            textura.add(props.frame, 0, info.x, info.y, info.w, info.h);
          }
          // gx/gy (no obj.x/obj.y: aquells ara segueixen el conveni de Tiled per ensenyar el moble a l'editor)
          // marquen la cantonada del "footprint" a la graella; restem l'ancoratge del JSON
          this.add.image(props.gx - info.anchor.x, props.gy - info.anchor.y, clauTextura, props.frame).setOrigin(0, 0);
        }
      }
    });

    // Emetem un esdeveniment global del joc perquè PhaserCanvas.vue el rebi
    this.game.events.emit('mapa-carregat', elementsDetectats);
  }

  // Mètode auxiliar per llegir Custom Properties de Tiled
  obtenirPropietats(obj) {
    const resultat = {};
    (obj.properties || []).forEach((p) => {
      resultat[p.name] = p.value;
    });
    return resultat;
  }
}
