<template>
  <section class="auth">
    <form class="card" autocomplete="off" @submit.prevent="handleLogin">
      <h2>Iniciar sesion</h2>
      <label class="field">
        <span>Correo</span>
        <input v-model="loginForm.correo" required type="email" placeholder="correo@dominio.com" />
      </label>
      <label class="field">
        <span>Contrasena</span>
        <input v-model="loginForm.password" required type="password" placeholder="Tu contrasena" />
      </label>
      <button class="button" type="submit" :disabled="loginLoading">
        {{ loginLoading ? 'Validando...' : 'Entrar' }}
      </button>
    </form>

    <div class="auth__feedback">
      <p v-if="errorMessage" class="alert alert--error">{{ errorMessage }}</p>
      <p v-if="infoMessage" class="alert alert--info">{{ infoMessage }}</p>
    </div>

    <p class="auth__switch">
      Necesitas crear una cuenta?
      <router-link to="/register">Ir al registro</router-link>
    </p>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useSession } from '../composables/useSession'
import { loginUsuario } from '../services/usuarioService'

const { errorMessage, infoMessage, persistSession, clearFeedback, setError, setInfo } = useSession()

const loginForm = reactive({
  correo: '',
  password: '',
})

const loginLoading = ref(false)

async function handleLogin() {
  clearFeedback()
  loginLoading.value = true
  try {
    const data = await loginUsuario(loginForm)
    persistSession(data)
    resetLoginForm()
    setInfo(`Bienvenido de nuevo, ${data.usuario.nombre}.`)
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
