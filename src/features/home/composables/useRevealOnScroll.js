import { onBeforeUnmount, onMounted } from 'vue'

export function useRevealOnScroll(selector = '.js-reveal') {
  let observer = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { threshold: 0.12 },
    )

    document.querySelectorAll(selector).forEach((el) => observer.observe(el))
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })
}
