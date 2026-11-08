import { insforge } from '@/lib/insforge'

export const authService = {
  async iniciarSesion(email: string, password: string) {
    return insforge.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
  },

  async registrarCuenta(email: string, password: string, username: string) {
    const res = await insforge.auth.signUp({
      email: email.trim(),
      password,
    })

    if (!res.error && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('pending_username', username.trim())
      } catch (e) {
        console.error('Error guardando pending_username en sessionStorage', e)
      }
    }

    return res
  },

  async verificarCorreo(email: string, otp: string) {
    return insforge.auth.verifyEmail({
      email: email.trim(),
      otp: otp.trim(),
    })
  },

  async crearPerfil(userId: string, username: string, email: string) {
    return insforge.database
      .from('usuarios')
      .insert([{ id_usuario: userId, username: username.trim(), email: email.trim() }])
  },

  async reenviarCodigo(email: string) {
    return insforge.auth.resendVerificationEmail({ email: email.trim() })
  },

  async obtenerUsuarioActual() {
    return insforge.auth.getCurrentUser()
  },

  async cerrarSesion() {
    return insforge.auth.signOut()
  },
}
