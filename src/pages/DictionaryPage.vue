<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { categories, signs } from '../data/signs'
import { firstLetter } from '../composables/useLetters'
import { mediaUrl } from '../composables/useSignMedia'
import { searchSigns } from '../composables/useSearch'
import SignMedia from '../components/features/SignMedia.vue'

const route = useRoute()
const queryParam = (name: string) => (typeof route.query[name] === 'string' ? (route.query[name] as string) : '')

const search = ref(queryParam('q'))
const category = ref(queryParam('cat') || 'all')
const letter = ref(queryParam('letter').toUpperCase())
const openId = ref<string | null>(null)

const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id

const inCategory = computed(() => signs.filter((sign) => category.value === 'all' || sign.category === category.value))
const letters = computed(() => [...new Set(inCategory.value.map((sign) => firstLetter(sign.word)))].sort())

const results = computed(() => {
  const filtered = inCategory.value.filter((sign) => !letter.value || firstLetter(sign.word) === letter.value)
  return searchSigns(filtered, search.value)
})

function selectCategory(id: string) {
  category.value = id
  letter.value = ''
  openId.value = null
}

function toggle(id: string) {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <RouterLink to="/" class="back">← Accueil</RouterLink>
  <h1>Dictionnaire</h1>

  <input v-model="search" type="search" class="search" placeholder="Rechercher un mot (ex. papa, chien…)" autofocus />

  <div class="chips">
    <button :class="{ active: category === 'all' }" @click="selectCategory('all')">Tout</button>
    <button v-for="c in categories" :key="c.id" :class="{ active: category === c.id }" @click="selectCategory(c.id)">
      {{ c.label }}
    </button>
  </div>

  <div v-if="!search && letters.length > 1" class="chips letters">
    <button :class="{ active: !letter }" @click="letter = ''">A–Z</button>
    <button v-for="l in letters" :key="l" :class="{ active: letter === l }" @click="letter = l">{{ l }}</button>
  </div>

  <p class="subtitle">{{ results.length }} signe(s)</p>

  <p v-if="!results.length" class="subtitle">
    Aucun signe pour « {{ search }} ». Ce mot n’est pas encore dans la base : essaie un synonyme ou une autre orthographe.
  </p>

  <ul class="entries">
    <li v-for="sign in results" :key="sign.id" class="entry">
      <button class="entry-row" :aria-expanded="openId === sign.id" @click="toggle(sign.id)">
        <span class="entry-word">{{ sign.word }}</span>
        <span class="entry-cat">{{ categoryLabel(sign.category) }}</span>
        <span aria-hidden="true">{{ openId === sign.id ? '▾' : '▶' }}</span>
      </button>
      <div v-if="openId === sign.id" class="entry-media">
        <SignMedia :src="mediaUrl(sign.id)" />
        <p v-if="sign.hint" class="subtitle">{{ sign.hint }}</p>
      </div>
    </li>
  </ul>
</template>
