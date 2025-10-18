import router from '@/router'
import { useSession } from '@/composables/useSession'

function getEnvBaseUrl() {
  const vite = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}
  const candidates = [
    vite.VITE_API_URL,
    process.env?.VITE_API_URL,
    process.env?.REACT_APP_API_URL,
    process.env?.VUE_APP_API_URL,
  ].filter(Boolean)
  // Fallback to backend host without proxy
  return candidates[0] || 'http://localhost:4000'
}

const BASE_URL = `${String(getEnvBaseUrl()).replace(/\/$/, '')}/clientes`

function toCamel(obj = {}) {
  const map = {
    tipo_cliente: 'tipoCliente',
    nombre_razon_social: 'nombreRazonSocial',
    tipo_documento: 'tipoDocumento',
    numero_documento: 'numeroDocumento',
    correo_electronico: 'correoElectronico',
  }
  const out = {}
  Object.keys(obj || {}).forEach((k) => {
    const nk = map[k] || k
    out[nk] = obj[k]
  })
  return out
}

function trimStrings(obj = {}) {
  const out = {}
  Object.entries(obj || {}).forEach(([k, v]) => {
    out[k] = typeof v === 'string' ? v.trim() : v
  })
  return out
}

async function request(path, { method = 'GET', body } = {}) {
  const { token } = useSession()
  const authToken = token?.value || localStorage.getItem('token') || ''
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  }

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await res.json().catch(() => ({})) : null

  if (!res.ok) {
    if (res.status === 401) {
      try {
        await router.push({ name: 'Inicio-sesion' })
      } catch (_) {
        // no-op
      }
    }
    const message =
      (res.status === 400 && (data?.error || 'Solicitud inválida')) ||
      (res.status === 404 && 'Ruta no encontrada') ||
      (data && (data.message || data.error)) ||
      `Error ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.payload = data
    throw err
  }

  return data
}

export async function listarClientes({ search } = {}) {
  const url = new URL(BASE_URL)
  if (search) url.searchParams.set('search', search)
  const data = await request(url.toString(), { method: 'GET' })
  const items = Array.isArray(data) ? data : data?.items || []
  return items.map(toCamel)
}

export async function obtenerCliente(id) {
  if (!id) throw new Error('ID del cliente requerido')
  const data = await request(`${BASE_URL}/${encodeURIComponent(id)}`, { method: 'GET' })
  return toCamel(data)
}

export async function crearCliente(payload) {
  const normalized = trimStrings(payload)
  // Backend expects camelCase payload; accept snake_case inputs and convert
  const body = toCamel(normalized)
  const data = await request(BASE_URL, { method: 'POST', body })
  return toCamel(data)
}

export async function actualizarCliente(id, payload) {
  if (!id) throw new Error('ID del cliente requerido')
  const normalized = trimStrings(payload)
  // Convert any snake_case input to camelCase before sending
  const body = toCamel(normalized)
  const data = await request(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body,
  })
  return toCamel(data)
}

export async function eliminarCliente(id) {
  if (!id) throw new Error('ID del cliente requerido')
  await request(`${BASE_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' })
  return true
}

export const validateCliente = (form) => {
  const errors = {}
  const allowedTipoCliente = ['Natural', 'Juridica']
  const allowedTipoDocumento = ['NIT', 'CC', 'CE', 'RUC', 'DNI']

  const nombre = (form?.nombreRazonSocial || '').trim()
  const tipoCliente = (form?.tipoCliente || '').trim()
  const tipoDocumento = (form?.tipoDocumento || '').trim()
  const numeroDocumento = (form?.numeroDocumento || '').trim()
  const correo = (form?.correoElectronico || '').trim()

  if (!tipoCliente || !allowedTipoCliente.includes(tipoCliente)) {
    errors.tipoCliente = 'Tipo de cliente inválido'
  }
  if (!nombre) {
    errors.nombreRazonSocial = 'El nombre o razón social es obligatorio'
  }
  if (!tipoDocumento || !allowedTipoDocumento.includes(tipoDocumento)) {
    errors.tipoDocumento = 'Tipo de documento inválido'
  }
  if (!numeroDocumento) {
    errors.numeroDocumento = 'El número de documento es obligatorio'
  }
  if (!correo) {
    errors.correoElectronico = 'El correo electrónico es obligatorio'
  } else {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!re.test(correo)) {
      errors.correoElectronico = 'Formato de correo inválido'
    }
  }

  return errors
}
