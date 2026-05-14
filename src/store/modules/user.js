import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getInfo, getMerchantInfo } from '../../api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref('')
  const nickname = ref('')
  const role = ref('')
  const merchantId = ref(null)
  const merchantName = ref('')

  function setLogin(data) {
    token.value = data.token
    username.value = data.username
    nickname.value = data.nickname
    role.value = data.role
    if (data.merchantId) merchantId.value = data.merchantId
    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.role)
  }

  function clearLogin() {
    token.value = ''
    username.value = ''
    nickname.value = ''
    role.value = ''
    merchantId.value = null
    merchantName.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('role')
  }

  async function fetchInfo() {
    const res = await getInfo()
    username.value = res.data.username
    nickname.value = res.data.nickname
    role.value = res.data.role
  }

  async function fetchMerchantInfo() {
    const res = await getMerchantInfo()
    merchantId.value = res.data.id
    nickname.value = res.data.nickName
    merchantName.value = res.data.name
  }

  return { token, username, nickname, role, merchantId, merchantName, setLogin, clearLogin, fetchInfo, fetchMerchantInfo }
})
