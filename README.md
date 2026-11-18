# Signes — apprendre la LSF (PWA)

Application mobile installable (PWA) pour apprendre la langue des signes française.
Stack : Vue 3 + Vite + Pinia + TypeScript, `vite-plugin-pwa` (Workbox). Hébergée sur **GitHub Pages**.

## Mise en ligne (une seule fois)

1. Créer un dépôt GitHub et pousser ce projet sur la branche `main`.
2. Dépôt → **Settings → Pages → Source : GitHub Actions**.
3. Le workflow `.github/workflows/deploy.yml` build et publie à chaque `git push` sur `main`.
4. L'app est disponible sur `https://<utilisateur>.github.io/<depot>/`.

## Installation sur mobile

- **Android (Chrome)** : menu ⋮ → « Installer l'application ».
- **iOS (Safari)** : Partager → « Sur l'écran d'accueil ».

## Mises à jour

À chaque push sur `main`, le workflow redéploie. L'app installée vérifie la présence d'une nouvelle version
au lancement, au retour au premier plan et toutes les heures. Quand elle en trouve une, un bandeau
**« Nouvelle version disponible »** propose de mettre à jour (le service worker est remplacé puis la page recharge).

La progression de l'utilisateur est stockée dans le `localStorage` de l'appareil : elle survit aux mises à jour.

## Ajouter du contenu

1. Ajouter une ligne dans `src/data/signs.ts` (`id`, mot, catégorie, aide-mémoire optionnel).
2. Déposer le média dans `public/media/<id>.mp4` (ou `.webm`, `.gif`, `.webp`).
   Privilégier des clips courts (quelques secondes, < 500 Ko), en boucle, sans son.
3. `git push` : le manifeste des médias (`src/data/media-manifest.json`) est régénéré au build.

Sans média, le signe apparaît quand même en révision (carte vide à auto-évaluer) mais est exclu du quiz.
Vérifier les droits d'utilisation des vidéos (enregistrements personnels ou sources sous licence libre).

## Importer des vidéos libres (Wikimedia Commons)

Prérequis sur ta machine : Node 22+ et `ffmpeg` (`brew install ffmpeg`).

```bash
npm run import:commons                 # simulation : liste les correspondances signe ↔ fichier
npm run import:commons -- --download   # télécharge, compresse en mp4, écrit src/data/credits.json
```

- Seules les licences réutilisables (CC BY, CC BY-SA, CC0, domaine public) sont retenues ; NC et ND sont écartées.
- Les crédits (auteur, licence, source) sont affichés dans l'écran **Crédits** : obligatoires avec CC BY / CC BY-SA.
- Par défaut seules les correspondances exactes sont acceptées (`--loose` accepte les partielles : à vérifier à l'œil).
- Vérifie toujours en simulation que le signe correspond bien au mot avant de télécharger.

## Développement

```bash
npm install
npm run dev      # serveur local
npm run build    # type-check + build de production dans dist/
npm run preview  # servir le build (test PWA / hors-ligne)
```

## Fonctionnement

- **Révision** : répétition espacée (Leitner, 5 boîtes : 0, 1, 3, 7, 14, 30 jours).
- **Quiz** : QCM « quelle est la signification de ce signe ? » (signes avec média uniquement).
- **Routage** en mode hash (`#/…`) : aucune configuration serveur nécessaire sur GitHub Pages.
- `base: './'` : fonctionne quel que soit le nom du dépôt.
