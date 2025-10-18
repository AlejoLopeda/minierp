const baseURL = 'http://localhost:4000/usuarios'

async function handleResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = (payload && payload.error) || fallbackMessage || 'Error en la peticion'
    throw new Error(message)
  }

  return payload
}

export async function registerUsuario({ nombre, correo, password }) {
  const response = await fetch(baseURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, password }),
  })

  const payload = await handleResponse(response, 'No fue posible registrar al usuario')
  return {
    ...payload,
    token: payload.token || payload.access_token || payload.accessToken || payload.jwt,
  }
}

export async function loginUsuario({ correo, password }) {
  const response = await fetch(`${baseURL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password }),
  })

  const payload = await handleResponse(response, 'No fue posible iniciar sesion')
  return {
    ...payload,
    token: payload.token || payload.access_token || payload.accessToken || payload.jwt,
  }
}
