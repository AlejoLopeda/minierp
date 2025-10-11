<template>
  <header class="main-navbar">
    <div class="main-navbar__logo">Mini ERP</div>
    <nav class="main-navbar__nav">
      <ul class="main-navbar__links">
        <li v-for="link in links" :key="link.route">
          <button type="button" class="main-navbar__button" @click="navigate(link.route)">
            {{ link.label }}
          </button>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'MainNavbar',
  setup() {
    const router = useRouter()
    const links = [
      { label: 'Inicio', route: '' },
      { label: 'Ventas', route: 'ventas' },
      { label: 'Compras', route: 'compras' },
      { label: 'Reportes', route: 'reportes' }
    ]

    const navigate = (path) => {
      router.push(`/${path}`)
    }

    return {
      links,
      navigate
    }
  }
}
</script>

<style scoped>
.main-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #004aad;
  padding: 1rem 2rem;
  color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.main-navbar__logo {
  font-weight: 700;
  font-size: 1.35rem;
  letter-spacing: 0.04em;
}

.main-navbar__links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.main-navbar__button {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.main-navbar__button:focus,
.main-navbar__button:hover {
  color: #ffcc00;
}

@media (max-width: 768px) {
  .main-navbar {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .main-navbar__links {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
