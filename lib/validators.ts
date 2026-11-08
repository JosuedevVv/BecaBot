const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validarEmail(email: string): string | undefined {
  const e = (email ?? '').trim()
  if (!e) return 'Escribe tu correo.'
  if (!EMAIL_RE.test(e)) return 'Ese correo no parece válido.'
  return undefined
}

export function validarPassword(password: string, minLength = 8): string | undefined {
  if (!password) return 'Escribe tu contraseña.'
  if (password.length < minLength) return `Debe tener al menos ${minLength} caracteres.`
  return undefined
}

export function validarUsername(username: string): string | undefined {
  const u = (username ?? '').trim()
  if (!u) return 'Escribe tu nombre de usuario.'
  if (u.length < 3) return 'Debe tener al menos 3 caracteres.'
  if (!/^[a-zA-Z0-9_.-]+$/.test(u)) return 'Solo letras, números, . _ -'
  return undefined
}

export function validarCodigoOtp(codigo: string, length = 6): string | undefined {
  if (!codigo || codigo.length !== length) {
    return `Introduce el código de ${length} dígitos.`
  }
  return undefined
}
