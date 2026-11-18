<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { signs } from '../data/signs'
import { hasMedia, mediaUrl } from '../composables/useSignMedia'
import { shuffle } from '../composables/useShuffle'
import SignMedia from '../components/features/SignMedia.vue'

const QUESTIONS_PER_QUIZ = 10
const CHOICES = 4

const route = useRoute()
const categoryId = String(route.params.cat)

const inCategory = signs.filter((sign) => categoryId === 'all' || sign.category === categoryId)
const questions = shuffle(inCategory.filter((sign) => hasMedia(sign.id))).slice(0, QUESTIONS_PER_QUIZ)

const index = ref(0)
const score = ref(0)
const picked = ref<string | null>(null)

const current = computed(() => questions[index.value] ?? null)

const choices = computed(() => {
  if (!current.value) return []
  const target = current.value
  // distracteurs : d'abord la même catégorie, puis le reste
  const others = shuffle(inCategory.filter((s) => s.id !== target.id))
  const fallback = shuffle(signs.filter((s) => s.id !== target.id && !others.includes(s)))
  return shuffle([target, ...[...others, ...fallback].slice(0, CHOICES - 1)])
})

function pick(id: string) {
  if (picked.value || !current.value) return
  picked.value = id
  if (id === current.value.id) score.value++
}

function next() {
  picked.value = null
  index.value++
}
</script>

<template>
  <RouterLink to="/" class="back">← Accueil</RouterLink>

  <p v-if="!questions.length" class="subtitle">
    Aucun signe de cette catégorie n’a encore de vidéo : ajoute des fichiers dans <code>public/media</code>.
  </p>

  <template v-else-if="current">
    <p class="subtitle">Question {{ index + 1 }} / {{ questions.length }}</p>
    <SignMedia :src="mediaUrl(current.id)" />
    <ul class="choices">
      <li v-for="choice in choices" :key="choice.id">
        <button
          :class="{
            correct: picked && choice.id === current.id,
            wrong: picked === choice.id && choice.id !== current.id,
          }"
          :disabled="!!picked"
          @click="pick(choice.id)"
        >
          {{ choice.word }}
        </button>
      </li>
    </ul>
    <button v-if="picked" @click="next">Suivant</button>
  </template>

  <div v-else class="answer">
    <h2>Score : {{ score }} / {{ questions.length }}</h2>
    <RouterLink to="/">Retour</RouterLink>
  </div>
</template>
