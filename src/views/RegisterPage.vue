<template>
  <section class="auth">
    <form class="card" autocomplete="off" @submit.prevent="handleRegister">
      <h2>Crear cuenta</h2>
      <label class="field">
        <span>Nombre</span>
        <input v-model="registerForm.nombre" required placeholder="Nombre completo" />
      </label>
      <label class="field">
        <span>Correo</span>
        <input v-model="registerForm.correo" required type="email" placeholder="correo@dominio.com" />
      </label>
      <label class="field">
        <span>Contrasena</span>
        <input
          v-model="registerForm.password"
          required
          type="password"
          placeholder="Minimo 6 caracteres"
          minlength="6"
        />
      </label>
      <button class="button" type="submit" :disabled="registerLoading">
        {{ registerLoading ? 'Registrando...' : 'Registrarme' }}
      </button>
    </form>

    <div class="auth__feedback">
      <p v-if="errorMessage" class="alert alert--error">{{ errorMessage }}</p>
      <p v-if="infoMessage" class="alert alert--info">{{ infoMessage }}</p>
    </div>

    <p class="auth__switch">
      Ya tienes cuenta?
      <router-link to="/login">Ir al login</router-link>
    </p>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useSession } from '../composables/useSession'
import { registerUsuario } from '../services/usuarioService'

const {
  errorMessage,
  infoMessage,
  persistSession,
  clearFeedback,
  setError,
  setInfo,
} = useSession()

const registerForm = reactive({
  nombre: '',
  correo: '',
  password: '',
})

const registerLoading = ref(false)

async function handleRegister() {
  clearFeedback()
  registerLoading.value = true
  try {
    const data = await registerUsuario(registerForm)
    persistSession(data)
    resetRegisterForm()
    setInfo(`Usuario ${data.usuario.nombre} registrado correctamente.`)
  } catch (error) {
    setError(error.message)
  } finally {
    registerLoading.value = false
  }
}

function resetRegisterForm() {
  registerForm.nombre = ''
  registerForm.correo = ''
  registerForm.password = ''
}
</script>

<style src="../theme/AuthPage.css"></style>
