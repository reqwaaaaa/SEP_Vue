import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getUserInfo } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const login = async (loginForm) => {
    const res = await loginApi(loginForm)
    token.value = res.data.accessToken
    localStorage.setItem('token', token.value)
    userInfo.value = res.data.userInfo
    localStorage.setItem('user', JSON.stringify(res.data.userInfo))
    return res
  }

  const fetchUserInfo = async () => {
    const res = await getUserInfo()
    userInfo.value = res.data
    localStorage.setItem('user', JSON.stringify(res.data))
    return res
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, userInfo, login, fetchUserInfo, logout }
})
