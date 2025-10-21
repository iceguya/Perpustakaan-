import axios from 'axios'


const api = axios.create({
baseURL: 'http://localhost:8000/api',
withCredentials: false,
})


export function setToken(token) {
if (token) {
api.defaults.headers.common['Authorization'] = `Bearer ${token}`
localStorage.setItem('token', token)
} else {
delete api.defaults.headers.common['Authorization']
localStorage.removeItem('token')
}
}


export async function login(email, password) {
const { data } = await api.post('/login', { email, password })
setToken(data.token)
return data
}


export async function me() {
const { data } = await api.get('/me')
return data
}


export async function getBooks(params = {}) {
const { data } = await api.get('/books', { params })
return data
}


export async function borrowBook({ member_id, book_id, days = 7 }) {
const { data } = await api.post('/borrow', { member_id, book_id, days })
return data
}


export async function getSummary() {
const { data } = await api.get('/admin/reports/summary')
return data
}


export default api