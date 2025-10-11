<template>
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
      <input v-model="loginForm.correo" required type="email" placeholder="correo@dominio.com" />
    </AuthField>
    <AuthField label="Contrasena">
      <input v-model="loginForm.password" required type="password" placeholder="Tu contrasena" />
    </AuthField>

    <template #switch>
      Necesitas crear una cuenta?
      <router-link to="/register">Ir al registro</router-link>
    </template>
  </AuthFormLayout>
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
