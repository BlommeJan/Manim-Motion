import { onMounted, onUnmounted } from 'vue'

export function useReveal() {
  let observer

  onMounted(() => {
    const els = document.querySelectorAll('.reveal')
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px 100px 0px' })
    els.forEach(el => observer.observe(el))
  })

  onUnmounted(() => {
    observer?.disconnect()
  })
}
