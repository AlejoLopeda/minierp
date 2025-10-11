<template>
  <div class="auth-page">
    <header class="auth-header">
      <h1 class="auth-title">Mini ERP</h1>
      <p class="auth-subtitle">Gestion de usuarios</p>
    </header>

    <main class="auth-main">
      <AuthFormLayout
        title="Crear cuenta"
        submit-text="Registrarme"
        loading-text="Registrando..."
        :loading="registerLoading"
        :error="errorMessage"
        :info="infoMessage"
        @submit="handleRegister"
      >
        <AuthField label="Nombre">
          <input v-model="registerForm.nombre" required placeholder="Ingresa tu nombre" />
        </AuthField>
        <AuthField label="Correo">
          <input v-model="registerForm.correo" required type="email" placeholder="Ingresa tu correo" />
        </AuthField>
        <AuthField label="Contraseña">
          <input
            v-model="registerForm.password"
            required
            type="password"
            placeholder="Ingresa tu contraseña"
            minlength="6"
          />
        </AuthField>

        <template #switch>
          Ya tienes una cuenta?
          <router-link to="/inicio-sesion">Ir al inicio de sesión</router-link>
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
import AuthField from '../components/auth/AuthField.vue'
import AuthFormLayout from '../components/auth/AuthFormLayout.vue'
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
