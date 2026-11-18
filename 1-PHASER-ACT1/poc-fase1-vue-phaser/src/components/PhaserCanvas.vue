<script setup>
// 1. Importem ref, watch i els hooks del cicle de vida de Vue 3
import { ref, watch, onMounted, onUnmounted } from 'vue';
// 2. Importem el motor Phaser 4 i la nostra escena personalitzada
import Phaser from 'phaser';
import { MainScene } from '../game/MainScene';

const props = defineProps(['nomUsuari', 'colorAvatar', 'estat']);

const contenidor = ref(null); // Apuntarà al <div ref="contenidor"> de sota
let game = null; // Guardem la instància per destruir-la en sortir

function hexAInt(hex) {
  return parseInt(hex.replace('#', ''), 16);
}

// S'executa un sol cop quan el <div> ja existeix a la pàgina
onMounted(() => {
  game = new Phaser.Game({
    type: Phaser.AUTO, // Tria WebGL automàticament (o Canvas 2D)
    width: 640,
    height: 400, // Mides del llenç en píxels
    backgroundColor: '#1e293b', // Fons fosc per distingir l'àrea del joc
    parent: contenidor.value, // Injecta el <canvas> dins del nostre <div>
    scene: [MainScene], // Escena inicial que arrencarà el motor
  });

  // Sincronitza l'estat actual només acabar d'arrencar (útil amb v-if)
  game.events.once('ready', () => {
    const escena = game?.scene.getScene('MainScene');
    escena?.actualitzarNom(props.nomUsuari);
    if (props.colorAvatar) escena?.canviarColor(hexAInt(props.colorAvatar));
    if (props.estat) escena?.actualitzarEstat(props.estat);
  });
});

// IMPRESCINDIBLE: quan s'amaga (v-if="false"), atura el bucle a 60 FPS
onUnmounted(() => game?.destroy(true));

// [NOU] Reacciona als canvis de nom en temps real
watch(
  () => props.nomUsuari,
  (nouNom) => {
    game?.scene.getScene('MainScene')?.actualitzarNom(nouNom);
  },
);

// [NOU] Reacciona als canvis de color en temps real (repte 1)
watch(
  () => props.colorAvatar,
  (nouColor) => {
    if (!nouColor) return;
    game?.scene.getScene('MainScene')?.canviarColor(hexAInt(nouColor));
  },
);

// [NOU] Reacciona als canvis d'estat en temps real (repte 2)
watch(
  () => props.estat,
  (nouEstat) => {
    game?.scene.getScene('MainScene')?.actualitzarEstat(nouEstat);
  },
);

// [NOU] Pausa / reprèn el Game Loop de l'escena activa (repte 3)
function alternarPausa() {
  const escena = game?.scene.getScene('MainScene');
  if (!escena) return;
  if (escena.scene.isPaused()) {
    escena.scene.resume();
  } else {
    escena.scene.pause();
  }
}

defineExpose({ alternarPausa });
</script>

<template><div ref="contenidor"></div></template>
<!-- Aquí s'injecta el <canvas> -->
