import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import LessonPage from './pages/LessonPage.vue'
import QuizPage from './pages/QuizPage.vue'
import CreditsPage from './pages/CreditsPage.vue'

// historique « hash » : aucune configuration serveur requise sur GitHub Pages
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/lesson/:cat', component: LessonPage },
    { path: '/quiz/:cat', component: QuizPage },
    { path: '/credits', component: CreditsPage },
  ],
})
