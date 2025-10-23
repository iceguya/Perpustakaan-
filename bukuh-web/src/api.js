import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      setToken(null)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { reason: '401' } }))
      }
      error.response = error.response ?? { data: {} }
      error.response.data =
        error.response.data ?? { message: 'Sesi kedaluwarsa. Silakan login kembali.' }
    } else if (error?.response?.status === 403) {
      error.response = error.response ?? { data: {} }
      error.response.data =
        error.response.data ?? { message: 'Anda tidak memiliki izin untuk aksi ini.' }
    }
    return Promise.reject(error)
  }
)

function unwrapCollection(payload) {
  if (Array.isArray(payload)) return { items: payload, meta: null }
  if (payload && Array.isArray(payload.data)) {
    const total =
      payload.meta?.total ??
      payload.total ??
      payload.data.length
    return {
      items: payload.data,
      meta: {
        total,
        page: payload.meta?.current_page ?? payload.current_page ?? 1,
        perPage: payload.meta?.per_page ?? payload.per_page ?? payload.data.length,
      },
    }
  }
  return { items: [], meta: null }
}

export function setToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    localStorage.setItem('token', token)
  } else {
    delete api.defaults.headers.common.Authorization
    localStorage.removeItem('token')
  }
}

export async function login(identifier, password) {
  const { data } = await api.post('/login', { identifier, password })
  if (data?.token) {
    setToken(data.token)
  }
  return data
}

export async function logout() {
  try {
    await api.post('/logout')
  } catch (err) {
    // token mungkin sudah invalid; abaikan
  } finally {
    setToken(null)
  }
}

export async function me() {
  const { data } = await api.get('/me')
  return data
}

export async function fetchBooks(params = {}) {
  const { data } = await api.get('/books', { params })
  return unwrapCollection(data)
}

export async function requestBorrow({ bookId, memberId } = {}) {
  const payload = { book_id: bookId }
  if (memberId) payload.member_id = memberId
  const { data } = await api.post('/borrow', payload)
  return data
}

export async function returnBorrow(id) {
  const { data } = await api.post(`/borrow/${id}/return`)
  return data
}

export async function fetchMyBorrows(params = {}) {
  const { data } = await api.get('/my/borrows', { params })
  return unwrapCollection(data)
}

export async function checkinAttendance(memberId) {
  const payload = {}
  if (memberId) payload.member_id = memberId
  const { data } = await api.post('/attendance', payload)
  return data
}

export async function updateReadProgress({ bookId, currentPage, totalPages, memberId }) {
  const payload = {
    book_id: bookId,
    current_page: currentPage,
    total_pages: totalPages,
  }
  if (memberId) payload.member_id = memberId
  const { data } = await api.post('/read/progress', payload)
  return data
}

export async function fetchReadHistory(memberId) {
  const params = {}
  if (memberId) params.member_id = memberId
  const { data } = await api.get('/read/history', { params })
  return data
}

export async function fetchAdminSummary() {
  const { data } = await api.get('/admin/reports/summary')
  return data
}

export async function fetchAdminBorrows(params = {}) {
  const { data } = await api.get('/admin/borrows', { params })
  return unwrapCollection(data)
}

export async function approveBorrow(id, payload = {}) {
  const { data } = await api.post(`/admin/borrows/${id}/approve`, payload)
  return data
}

export async function rejectBorrow(id) {
  const { data } = await api.post(`/admin/borrows/${id}/reject`)
  return data
}

export async function listAdminBooks(params = {}) {
  const { data } = await api.get('/admin/books', { params })
  return unwrapCollection(data)
}

export async function createBook(payload) {
  const { data } = await api.post('/admin/books', payload)
  return data
}

export async function updateBook(id, payload) {
  const { data } = await api.put(`/admin/books/${id}`, payload)
  return data
}

export async function deleteBook(id) {
  await api.delete(`/admin/books/${id}`)
}

export async function listMembers(params = {}) {
  const { data } = await api.get('/admin/members', { params })
  return unwrapCollection(data)
}

export async function createMember(payload) {
  const { data } = await api.post('/admin/members', payload)
  return data
}

export async function updateMember(id, payload) {
  const { data } = await api.put(`/admin/members/${id}`, payload)
  return data
}

export async function deleteMember(id) {
  await api.delete(`/admin/members/${id}`)
}

export default api
