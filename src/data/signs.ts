import type { Category, Sign } from '../types'

export const categories: Category[] = [
  { id: 'salutations', label: 'Salutations', emoji: '👋' },
  { id: 'famille', label: 'Famille', emoji: '👨‍👩‍👧' },
  { id: 'couleurs', label: 'Couleurs', emoji: '🎨' },
  { id: 'questions', label: 'Questions', emoji: '❓' },
]

const s = (category: string, id: string, word: string, hint?: string): Sign => ({ id, word, category, hint })

// Pour ajouter un signe : une ligne ici + un fichier public/media/<id>.mp4 (ou .webm/.gif/.webp)
export const signs: Sign[] = [
  s('salutations', 'bonjour', 'Bonjour'),
  s('salutations', 'au-revoir', 'Au revoir'),
  s('salutations', 'merci', 'Merci'),
  s('salutations', 'sil-vous-plait', 'S’il vous plaît'),
  s('salutations', 'pardon', 'Pardon'),
  s('salutations', 'oui', 'Oui'),
  s('salutations', 'non', 'Non'),

  s('famille', 'maman', 'Maman'),
  s('famille', 'papa', 'Papa'),
  s('famille', 'grand-mere', 'Grand-mère'),
  s('famille', 'grand-pere', 'Grand-père'),
  s('famille', 'frere', 'Frère'),
  s('famille', 'soeur', 'Sœur'),
  s('famille', 'enfant', 'Enfant'),
  s('famille', 'famille', 'Famille'),

  s('couleurs', 'rouge', 'Rouge'),
  s('couleurs', 'bleu', 'Bleu'),
  s('couleurs', 'vert', 'Vert'),
  s('couleurs', 'jaune', 'Jaune'),
  s('couleurs', 'noir', 'Noir'),
  s('couleurs', 'blanc', 'Blanc'),

  s('questions', 'quoi', 'Quoi'),
  s('questions', 'qui', 'Qui'),
  s('questions', 'ou', 'Où'),
  s('questions', 'quand', 'Quand'),
  s('questions', 'pourquoi', 'Pourquoi'),
  s('questions', 'comment', 'Comment'),

]
