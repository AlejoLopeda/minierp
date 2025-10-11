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

  return handleResponse(response, 'No fue posible registrar al usuario')
}

export async function loginUsuario({ correo, password }) {
  const response = await fetch(`${baseURL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password }),
  })

  return handleResponse(response, 'No fue posible iniciar sesion')
}
