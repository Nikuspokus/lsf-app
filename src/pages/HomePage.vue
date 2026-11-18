<script setup lang="ts">
import { categories, signs } from '../data/signs'
import { useProgressStore } from '../stores/useProgressStore'
import { hasMedia } from '../composables/useSignMedia'
import { firstLetter } from '../composables/useLetters'

const store = useProgressStore()
const version = __APP_VERSION__

const letters = [...new Set(signs.filter((sign) => sign.category === 'vocabulaire').map((sign) => firstLetter(sign.word)))].sort()

const stats = (categoryId: string) => {
  const ids = signs.filter((sign) => sign.category === categoryId).map((sign) => sign.id)
  return {
    total: ids.length,
    mastered: store.masteredCount(ids),
    withMedia: ids.filter(hasMedia).length,
  }
}

const visibleCategories = categories.filter((category) => category.id !== 'vocabulaire' || stats('vocabulaire').total > 0)
</script>

<template>
  <header>
    <h1>Signes</h1>
    <p class="subtitle">Apprendre la langue des signes française</p>
  </header>

  <ul class="cards">
    <li v-for="category in visibleCategories" :key="category.id" class="card">
      <h2>{{ category.emoji }} {{ category.label }}</h2>
      <p>{{ stats(category.id).mastered }} / {{ stats(category.id).total }} maîtrisés</p>
      <progress :value="stats(category.id).mastered" :max="stats(category.id).total" />
      <p v-if="category.id === 'vocabulaire' && letters.length" class="letters">
        <RouterLink v-for="letter in letters" :key="letter" :to="`/lesson/vocabulaire?letter=${letter}`">{{ letter }}</RouterLink>
      </p>
      <div class="actions">
        <RouterLink :to="`/lesson/${category.id}`">Réviser</RouterLink>
        <RouterLink v-if="stats(category.id).withMedia" :to="`/quiz/${category.id}`">Quiz</RouterLink>
      </div>
    </li>
  </ul>

  <p class="footer">
    <RouterLink to="/lesson/all">Tout réviser</RouterLink> ·
    <RouterLink to="/quiz/all">Quiz général</RouterLink> ·
    <RouterLink to="/credits">Crédits</RouterLink> ·
    <a href="#" @click.prevent="store.reset()">Réinitialiser</a>
    <br />v{{ version }}
  </p>
</template>
