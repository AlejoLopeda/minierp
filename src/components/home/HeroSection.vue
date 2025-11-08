<template>
  <section class="hero" ref="rootRef">
    <div class="hero__bg" :class="{ 'is-visible': mounted }">
      <span class="blob blob--1"></span>
      <span class="blob blob--2"></span>
      <span class="blob blob--3"></span>
      <span class="mesh"></span>
      <span class="aurora"></span>
      <svg class="fx" width="0" height="0" viewBox="0 0 10 10" aria-hidden="true">
        <defs>
          <filter id="hero-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="2">
              <animate attributeName="baseFrequency" dur="14s" values="0.9;0.6;0.9" repeatCount="indefinite" />
            </feTurbulence>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
        </defs>
      </svg>
      <div class="grain" aria-hidden="true"></div>
    </div>

    <div class="hero__inner">
      <div class="hero__content">
        <h1 class="hero__title">
          Todo tu negocio, <span>en un solo lugar.</span>
        </h1>
        <p class="hero__subtitle">
          Mini ERP centraliza ventas, compras, inventarios y reportes para que tu equipo avance con fluidez.
        </p>
        <div class="hero__actions">
          <button type="button" class="btn btn--primary" @click="$emit('primary-cta')">
            Empezar creando un tercero
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'HeroSection',
  emits: ['primary-cta'],
  setup() {
    const mounted = ref(false)
    const rootRef = ref(null)
    onMounted(() => { mounted.value = true })
    return { mounted, rootRef }
  },
}
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  border-radius: 0;
  padding: 96px 0;
  margin: 0 0 32px;
  width: 100vw; /* full-bleed */
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  background: radial-gradient(1200px 600px at 10% 0%, rgba(0, 74, 173, 0.08), transparent 60%),
              linear-gradient(180deg, #ffffff, #f6f8ff);
}

/* Capa de brillo/gradiente animado sutil */
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: conic-gradient(from 0deg at 70% 30%, rgba(13,110,253,.18), rgba(34,197,94,.12), rgba(245,158,11,.12), rgba(13,110,253,.18));
  mix-blend-mode: soft-light;
  opacity: .55;
  animation: home-rotate 16s linear infinite;
  pointer-events: none;
}

.hero__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity .6s ease;
}
.hero__bg.is-visible { opacity: 1; }

.mesh::before {
  content: '';
  position: absolute;
  inset: -40% -10% -10% -40%;
  background: radial-gradient(1000px 600px at 80% 10%, rgba(13,110,253,0.15), transparent 60%),
              radial-gradient(800px 500px at 10% 70%, rgba(0,74,173,0.18), transparent 60%);
  filter: blur(40px);
  animation: home-mesh-pan 18s ease-in-out infinite;
}

.aurora {
  position: absolute;
  inset: -30% -10% -10% -30%;
  background: radial-gradient(60% 40% at 20% 30%, rgba(0,74,173,.35), transparent 60%),
              radial-gradient(60% 40% at 80% 70%, rgba(13,110,253,.25), transparent 60%),
              radial-gradient(40% 40% at 60% 20%, rgba(245,158,11,.25), transparent 60%),
              radial-gradient(50% 50% at 30% 80%, rgba(34,197,94,.25), transparent 60%);
  filter: blur(50px) saturate(120%);
  animation: aurora-pan 24s ease-in-out infinite alternate;
  opacity: .6;
}

.grain {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.02);
  filter: url(#hero-noise);
  mix-blend-mode: overlay;
  opacity: .5;
  pointer-events: none;
}

.blob {
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  filter: blur(60px);
  opacity: .33;
  animation: home-blob-float 18s ease-in-out infinite,
             home-blob-drift 28s linear infinite;
}
.blob--1 { background: #0d6efd; top: -120px; left: -80px; }
.blob--2 { background: #22c55e; bottom: -140px; right: -60px; animation-delay: -6s; }
.blob--3 { background: #f59e0b; top: 30%; right: 25%; animation-delay: -12s; }

.hero__inner { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
.hero__content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.hero__title {
  margin: 0;
  font-size: clamp(28px, 5vw, 44px);
  line-height: 1.1;
  color: #111827;
  letter-spacing: -0.02em;
  animation: home-fade-up .8s ease both .1s;
}
.hero__title span {
  background: linear-gradient(135deg, #004aad, #0d6efd);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero__subtitle {
  margin: 12px auto 20px;
  max-width: 760px;
  color: #4b5563;
  font-size: clamp(14px, 2.6vw, 18px);
  animation: home-fade-up .8s ease both .2s;
}

.hero__actions { animation: home-fade-up .8s ease both .3s; }

.btn {
  border: 0;
  cursor: pointer;
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 600;
  transition: transform .2s ease, box-shadow .2s ease, background-color .2s ease;
}
.btn--primary {
  background: linear-gradient(135deg, #004aad, #0d6efd);
  color: #fff;
  box-shadow: 0 10px 18px rgba(13, 110, 253, 0.25);
}
.btn--primary:hover { transform: translateY(-1px); box-shadow: 0 12px 20px rgba(13,110,253,.35); }

@keyframes home-blob-float {
  0%, 100% { transform: translate3d(0,0,0) scale(1); }
  50% { transform: translate3d(20px, -18px, 0) scale(1.06); }
}
@keyframes home-blob-drift {
  0% { filter: blur(60px); }
  50% { filter: blur(70px); }
  100% { filter: blur(60px); }
}
@keyframes home-fade-up {
  from { opacity: 0; transform: translate3d(0, 10px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes home-mesh-pan {
  0% { transform: translate3d(-2%, -1%, 0) scale(1); }
  50% { transform: translate3d(1%, 2%, 0) scale(1.03); }
  100% { transform: translate3d(-2%, -1%, 0) scale(1); }
}
@keyframes home-rotate { to { transform: rotate(360deg); } }
@keyframes aurora-pan {
  0% { transform: translate3d(-6%, -4%, 0) scale(1); }
  50% { transform: translate3d(5%, 6%, 0) scale(1.06); }
  100% { transform: translate3d(-4%, 3%, 0) scale(1.02); }
}

@media (prefers-reduced-motion: reduce) {
  .blob { animation: none; }
  .hero::after { animation: none; }
  .mesh::before { animation: none; }
  .aurora { animation: none; }
}
</style>
