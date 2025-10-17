import { useSession } from '@/composables/useSession'

const BASE_URL = 'http://localhost:4000/clientes'

function toSnake(obj = {}) {
  const map = {
    tipoCliente: 'tipo_cliente',
    nombreRazonSocial: 'nombre_razon_social',
    tipoDocumento: 'tipo_documento',
    numeroDocumento: 'numero_documento',
    correoElectronico: 'correo_electronico',
  }
  const out = {}
  Object.keys(obj).forEach((k) => {
    const nk = map[k] || k
    out[nk] = obj[k]
  })
  return out
}

function toCamel(obj = {}) {
  const map = {
    tipo_cliente: 'tipoCliente',
    nombre_razon_social: 'nombreRazonSocial',
    tipo_documento: 'tipoDocumento',
    numero_documento: 'numeroDocumento',
    correo_electronico: 'correoElectronico',
  }
  const out = {}
  Object.keys(obj).forEach((k) => {
    const nk = map[k] || k
    out[nk] = obj[k]
  })
  return out
}

async function request(path, { method = 'GET', body } = {}) {
  const { token } = useSession()
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
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
    const apiMessage = (data && (data.message || data.error)) || `Error ${res.status}`
    const err = new Error(apiMessage)
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
  const data = await request(BASE_URL, { method: 'POST', body: toSnake(payload) })
  return toCamel(data)
}

export async function actualizarCliente(id, payload) {
  if (!id) throw new Error('ID del cliente requerido')
  const data = await request(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: toSnake(payload),
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
