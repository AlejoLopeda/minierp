import { computed, ref } from 'vue'

const TOKEN_KEY = 'minierp_token'
const USER_KEY = 'minierp_usuario'

const token = ref(localStorage.getItem(TOKEN_KEY) || '')
const currentUser = ref(readStoredUser())
const errorMessage = ref('')
const infoMessage = ref('')

function readStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch (error) {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function useSession() {
  function persistSession({ usuario, token: sessionToken }) {
    token.value = sessionToken || ''
    currentUser.value = usuario || null

    if (sessionToken) {
      localStorage.setItem(TOKEN_KEY, sessionToken)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }

    if (usuario) {
      localStorage.setItem(USER_KEY, JSON.stringify(usuario))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }

  function clearSession() {
    token.value = ''
    currentUser.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const tokenPreview = computed(() => {
    if (!token.value) return '-'
    const head = token.value.slice(0, 12)
    const tail = token.value.slice(-6)
    return `${head}...${tail}`
  })

  function clearFeedback() {
    errorMessage.value = ''
    infoMessage.value = ''
  }

  function setError(message) {
    errorMessage.value = message
  }

  function setInfo(message) {
    infoMessage.value = message
  }

  return {
    token,
    currentUser,
    errorMessage,
    infoMessage,
    tokenPreview,
    persistSession,
    clearSession,
    clearFeedback,
    setError,
    setInfo,
  }
}
