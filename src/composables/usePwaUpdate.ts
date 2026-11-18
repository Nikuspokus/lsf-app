import { useRegisterSW } from 'virtual:pwa-register/vue'

const CHECK_EVERY_MS = 60 * 60 * 1000 // 1 h

/**
 * Enregistre le service worker et expose l'état « nouvelle version prête ».
 * `updateServiceWorker(true)` active la nouvelle version puis recharge la page.
 */
export function usePwaUpdate() {
  const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      // revérifie le dépôt déployé toutes les heures et au retour sur l'app
      setInterval(() => registration.update(), CHECK_EVERY_MS)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update()
      })
    },
  })

  return { needRefresh, offlineReady, updateServiceWorker }
}
