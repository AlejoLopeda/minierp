let __rvLastY = typeof window !== 'undefined' ? window.scrollY : 0
let __rvDir = 'down'
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => {
    const y = window.scrollY || 0
    __rvDir = y > __rvLastY ? 'down' : 'up'
    __rvLastY = y
  }, { passive: true })
}

const reveal = {
  mounted(el, binding) {
    const effect = binding.arg || (binding.modifiers.left ? 'left' : binding.modifiers.right ? 'right' : binding.modifiers.scale ? 'scale' : 'up')
    el.classList.add('reveal')
    if (effect && effect !== 'up') el.classList.add(`rv-${effect}`)
    const delay = (binding.value && binding.value.delay) || 0
    if (delay) el.style.setProperty('--rv-delay', `${Number(delay)}ms`)

    const options = {
      root: null,
      rootMargin: binding.value?.rootMargin || '0px 0px -10% 0px',
      threshold: binding.value?.threshold ?? 0.15,
    }
    // comportamiento: aparece al bajar, desaparece al subir
    const hideOnDown = Boolean(binding.value && binding.value.hideOnDown)

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
        } else {
          // si se desplaza hacia arriba, ocultar; si hacia abajo, opcional
          if (__rvDir === 'up' || hideOnDown) {
            el.classList.remove('is-visible')
          }
        }
      })
    }, options)

    observer.observe(el)
    el.__rvObserver = observer
  },
  unmounted(el) {
    if (el.__rvObserver) {
      el.__rvObserver.disconnect()
      delete el.__rvObserver
    }
  },
}

export default reveal
