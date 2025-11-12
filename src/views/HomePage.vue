<template>
  <div class="home">
    <HeroSection @primary-cta="irACrearTercero" />
    <KPICards />
    <ChartsBoard />
    <LiveWidgets />
    <QuickActions />
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import HeroSection from '@/components/home/HeroSection.vue'
import KPICards from '@/components/home/KPICards.vue'
import QuickActions from '@/components/home/QuickActions.vue'
import LiveWidgets from '@/components/home/LiveWidgets.vue'
import ChartsBoard from '@/components/home/ChartsBoard.vue'

export default {
  name: 'HomePage',
  components: { HeroSection, KPICards, QuickActions, ChartsBoard, LiveWidgets },
  setup() {
    const router = useRouter()
    const irACrearTercero = () => { router.push({ name: 'TercerosCrear' }) }
    return { irACrearTercero }
  },
}
</script>

<style scoped>
.home { display: flex; flex-direction: column; gap: 6px; }
</style>
