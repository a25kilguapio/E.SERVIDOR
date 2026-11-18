<script setup>
import { ref, useTemplateRef } from 'vue';
// Importem el component pont que conté el <canvas> de Phaser
import PhaserCanvas from './components/PhaserCanvas.vue';

// Variable reactiva que guarda el nom escrit a la caixa de text
const nom = ref('Anna');

// Booleà per muntar/desmuntar el joc i verificar onMounted / onUnmounted
const mostrarJoc = ref(true);

// [NOU] Repte 1: color de l'avatar
const colorAvatar = ref('#10b981');

// [NOU] Repte 2: indicador d'estat
const estat = ref('Disponible');

// [NOU] Repte 3: pausa / reprèn el Game Loop
const enPausa = ref(false);
const phaserCanvasRef = useTemplateRef('phaserCanvasRef');

function alternarPausa() {
  phaserCanvasRef.value?.alternarPausa();
  enPausa.value = !enPausa.value;
}
</script>

<template>
  <main class="contenidor-app">
    <!-- Tota la interfície d'usuari (inputs, botons) es fa en HTML/CSS dins de Vue -->
    <div class="controls">
      <input v-model="nom" placeholder="Escriu el teu nom d'usuari..." />

      <input v-model="colorAvatar" type="color" title="Color de l'avatar" />

      <select v-model="estat">
        <option value="Disponible">Disponible</option>
        <option value="Ocupat">Ocupat</option>
        <option value="Absent">Absent</option>
      </select>

      <button @click="mostrarJoc = !mostrarJoc">
        {{ mostrarJoc ? 'Amaga el llenç' : 'Mostra el llenç' }}
      </button>

      <button :disabled="!mostrarJoc" @click="alternarPausa">
        {{ enPausa ? 'Reprèn' : 'Pausa' }}
      </button>
    </div>

    <!-- Passem les dades cap avall amb props i controlem el cicle amb v-if -->
    <PhaserCanvas
      v-if="mostrarJoc"
      ref="phaserCanvasRef"
      :nomUsuari="nom"
      :colorAvatar="colorAvatar"
      :estat="estat"
    />
  </main>
</template>

<style scoped>
.contenidor-app {
  max-width: 680px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
