<template>
  <div class="auth-page">
    <header class="auth-header">
      <h1 class="auth-title">Mini ERP</h1>
      <p class="auth-subtitle">Gestion de usuarios</p>
    </header>

    <main class="auth-main">
      <AuthFormLayout
        title="Iniciar sesion"
        submit-text="Entrar"
        loading-text="Validando..."
        :loading="loginLoading"
        :error="errorMessage"
        :info="infoMessage"
        @submit="handleLogin"
      >
        <AuthField label="Correo">
          <input v-model="loginForm.correo" required type="email" placeholder="Ingresa tu correo" />
        </AuthField>
        <AuthField label="Contraseña">
          <input v-model="loginForm.password" required type="password" placeholder="Ingresa tu contraseña" />
        </AuthField>

        <template #switch>
          No tienes una cuenta?
          <router-link to="/registro">Ir al registro de usuario</router-link>
        </template>
      </AuthFormLayout>
    </main>

    <footer class="auth-footer">
      <p>© 2025 Mini ERP | Sistema de gestión empresarial</p>
    </footer>
  </div>
  
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthField from '../components/auth/AuthField.vue'
import AuthFormLayout from '../components/auth/AuthFormLayout.vue'
import { useSession } from '../composables/useSession'
import { loginUsuario } from '../services/usuarioService'

const { errorMessage, infoMessage, persistSession, clearFeedback, setError, setInfo } = useSession()

const loginForm = reactive({
  correo: '',
  password: '',
})

const loginLoading = ref(false)
const router = useRouter()
const route = useRoute()

async function handleLogin() {
  clearFeedback()
  loginLoading.value = true
  try {
    const data = await loginUsuario(loginForm)
    persistSession(data)
    resetLoginForm()
    setInfo(`Bienvenido de nuevo, ${data.usuario.nombre}.`)
    const redirectPath = route.query.redirect
    const targetLocation =
      typeof redirectPath === 'string' && redirectPath ? redirectPath : { name: 'Home' }
    await router.push(targetLocation)
  } catch (error) {
    setError(error.message)
  } finally {
    loginLoading.value = false
  }
}

function resetLoginForm() {
  loginForm.correo = ''
  loginForm.password = ''
}
</script>

<style src="../theme/AuthPage.css"></style>
