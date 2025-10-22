export const storage = {
  safeParse<T = any>(value: string | null, fallback: T | null = null): T | null {
    if (!value) return fallback
    try { return JSON.parse(value) as T } catch { return fallback }
  },

  // token
  getToken(): string | null { return localStorage.getItem("token") },
  setToken(token: string) { localStorage.setItem("token", token) },
  removeToken() { localStorage.removeItem("token") },

  // userData (obj)
  getUserData<T = any>(): T | null { return this.safeParse<T>(localStorage.getItem("userData"), null) },
  setUserData(data: any) { localStorage.setItem("userData", JSON.stringify(data)) },
  removeUserData() { localStorage.removeItem("userData") },

  // userSession (obj usado en contexto)
  getUserSession<T = any>(): T | null { return this.safeParse<T>(localStorage.getItem("userSession"), null) },
  setUserSession(data: any) { localStorage.setItem("userSession", JSON.stringify(data)) },
  removeUserSession() { localStorage.removeItem("userSession") },

  // claves individuales (compatibilidad)
  getUserId(): string | null { return localStorage.getItem("user_id") },
  setUserId(id: string | number) { localStorage.setItem("user_id", String(id)) },
  removeUserId() { localStorage.removeItem("user_id") },

  getPlanId(): string | null { return localStorage.getItem("plan_id") },
  setPlanId(id: string | number) { localStorage.setItem("plan_id", String(id)) },
  removePlanId() { localStorage.removeItem("plan_id") },

  getName(): string | null { return localStorage.getItem("name") },
  setName(name: string) { localStorage.setItem("name", name) },
  removeName() { localStorage.removeItem("name") },

  // conversations (array)
  getConversations<T = any[]>(): T | null { return this.safeParse<T>(localStorage.getItem("conversations"), null) },
  setConversations(data: any) { localStorage.setItem("conversations", JSON.stringify(data)) },
  removeConversations() { localStorage.removeItem("conversations") },

  // limpiar solo las claves de la app
  clearAll() {
    this.removeToken()
    this.removeUserData()
    this.removeUserSession()
    this.removeUserId()
    this.removePlanId()
    this.removeName()
    this.removeConversations()
  }
}

export default storage