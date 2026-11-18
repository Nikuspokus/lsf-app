<script setup lang="ts">
import credits from '../data/credits.json'
import { signs } from '../data/signs'

interface Credit {
  author: string
  license: string
  licenseUrl: string
  source: string
}

const entries = signs
  .filter((sign) => sign.id in credits)
  .map((sign) => ({ sign, credit: (credits as Record<string, Credit>)[sign.id] }))
</script>

<template>
  <RouterLink to="/" class="back">← Accueil</RouterLink>
  <h1>Crédits</h1>
  <p v-if="!entries.length" class="subtitle">Aucune vidéo sous licence libre n’est encore référencée.</p>
  <ul v-else class="cards">
    <li v-for="{ sign, credit } in entries" :key="sign.id" class="card">
      <h2>{{ sign.word }}</h2>
      <p>
        {{ credit.author }} ·
        <a :href="credit.licenseUrl || credit.source" target="_blank" rel="noopener">{{ credit.license }}</a> ·
        <a :href="credit.source" target="_blank" rel="noopener">Source (Wikimedia Commons)</a>
      </p>
    </li>
  </ul>
</template>
