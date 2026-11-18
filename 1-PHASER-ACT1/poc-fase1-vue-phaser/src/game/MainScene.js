import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  constructor() {
    // Registrem l'escena amb la clau 'MainScene' per recuperar-la des de Vue
    super('MainScene');
  }

  // 1. S'executa UN SOL COP en iniciar l'escena: creem els GameObjects
  create() {
    // Dibuixem un cercle verd al centre (x=320, y=200, radi=24px)
    this.avatar = this.add.circle(320, 200, 24, 0x10b981);

    // Afegim un text flotant damunt l'avatar i el centrem amb .setOrigin(0.5)
    this.etiqueta = this.add
      .text(320, 160, 'Anna', {
        fontSize: '18px',
        fontFamily: 'sans-serif',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Text d'estat, just a sota del nom
    this.textEstat = this.add
      .text(320, 182, 'Disponible', {
        fontSize: '14px',
        fontFamily: 'sans-serif',
        color: '#94a3b8',
      })
      .setOrigin(0.5);
  }

  // 2. Bucle continu a 60 FPS: s'executa 60 vegades per segon
  update(time) {
    // Fem oscil·lar l'avatar amunt i avall per verificar que el Game Loop batega
    this.avatar.y = 200 + Math.sin(time * 0.004) * 8;

    // Actualitzem la posició del nom i de l'estat perquè segueixin sempre l'avatar
    this.etiqueta.setPosition(this.avatar.x, this.avatar.y - 38);
    this.textEstat.setPosition(this.avatar.x, this.avatar.y - 16);
  }

  // [NOU] Canvia el text de l'etiqueta sense reiniciar l'escena
  actualitzarNom(nouNom) {
    // ?. evita errors si l'escena encara carrega; || 'Anònim' evita text buit
    this.etiqueta?.setText(nouNom || 'Anònim');
  }

  // [NOU] Canvia el color de l'avatar (repte 1: selector de color)
  canviarColor(hexColor) {
    this.avatar?.setFillStyle(hexColor);
  }

  // [NOU] Canvia el text d'estat (repte 2: indicador d'estat)
  actualitzarEstat(nouEstat) {
    this.textEstat?.setText(nouEstat);
  }
}
