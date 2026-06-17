import { onBeforeUnmount, onMounted } from 'vue'

export function useContactReveal(selector = '.ct-fade-up') {
  let revealObserver = null

  onMounted(() => {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('ct-visible')
        })
      },
      { threshold: 0.08 },
    )

    document.querySelectorAll(selector).forEach((element) => revealObserver.observe(element))
  })

  onBeforeUnmount(() => {
    revealObserver?.disconnect()
    revealObserver = null
  })
}
