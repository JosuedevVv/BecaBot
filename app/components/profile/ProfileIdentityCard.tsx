'use client'

import { useState } from 'react'
import { profileService, type PerfilUsuario } from '@/services/ProfileService'
import { authService } from '@/services/AuthService'
import { useRouter } from 'next/navigation'

export const ProfileIdentityCard = ({
  perfil,
  userId,
  onUsernameUpdated,
}: {
  perfil: PerfilUsuario | null
  userId: string
  onUsernameUpdated: (newUsername: string) => void
}) => {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [newUsername, setNewUsername] = useState(perfil?.username || '')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername.trim()) {
      setErrorMsg('El nombre de usuario no puede estar vacío.')
      return
    }

    setSaving(true)
    setErrorMsg(null)
    try {
      const { error } = await profileService.actualizarUsername(userId, newUsername)
      if (error) {
        setErrorMsg('No se pudo actualizar el nombre de usuario.')
        return
      }
      onUsernameUpdated(newUsername.trim())
      setIsEditing(false)
    } catch {
      setErrorMsg('Error de conexión al actualizar.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await authService.cerrarSesion()
      router.push('/')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  const fechaRegistro = perfil?.created_at
    ? new Date(perfil.created_at).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Reciente'

  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000]">
      <div>
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <span className="rounded-md border-2 border-black bg-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
            IDENTIDAD Y CUENTA
          </span>
          <span className="text-[11px] font-bold text-neutral-600">
            Miembro desde {fechaRegistro}
          </span>
        </div>

        {/* Username & Avatar tipográfico */}
        <div className="mt-5 flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-black text-xl font-black text-white shadow-[3px_3px_0px_#000000]">
            {(perfil?.username || 'E').slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            {isEditing ? (
              <form onSubmit={handleSave} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    disabled={saving}
                    className="h-9 w-full rounded-lg border-2 border-black px-2.5 text-sm font-bold text-black outline-none focus:shadow-[2px_2px_0px_#000000]"
                    placeholder="nuevo_username"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-9 shrink-0 items-center rounded-lg border-2 border-black bg-black px-3 text-xs font-black text-white shadow-[2px_2px_0px_#000000] hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {saving ? '…' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      setNewUsername(perfil?.username || '')
                      setErrorMsg(null)
                    }}
                    className="inline-flex h-9 shrink-0 items-center rounded-lg border-2 border-black bg-white px-2.5 text-xs font-bold text-black hover:bg-neutral-100"
                  >
                    ✕
                  </button>
                </div>
                {errorMsg && <p className="text-[11px] font-bold text-red-600">{errorMsg}</p>}
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="truncate font-display text-2xl font-black text-black">
                  @{perfil?.username || 'estudiante'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-md border border-neutral-300 px-2 py-0.5 text-[11px] font-bold text-neutral-700 hover:border-black hover:text-black"
                >
                  Editar
                </button>
              </div>
            )}

            <p className="mt-1 truncate text-[13.5px] font-semibold text-neutral-700">
              {perfil?.email || 'Sin correo asociado'}
            </p>
          </div>
        </div>

        {/* Fila informativa de seguridad */}
        <div className="mt-6 flex flex-col gap-2 rounded-xl border-2 border-black bg-neutral-50 p-3.5 shadow-[2px_2px_0px_#000000]">
          <div className="flex items-center justify-between text-xs font-bold text-black">
            <span>Estado del Correo</span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-600" />
              Verificado
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-black">
            <span>Zona horaria de becas</span>
            <span className="text-neutral-700">América/Mexico_City (CST)</span>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t-2 border-neutral-200 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-white px-4 text-xs font-black text-red-600 shadow-[3px_3px_0px_#000000] transition-all hover:bg-red-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
        >
          <span>{loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</span>
          <span>↗</span>
        </button>
      </div>
    </article>
  )
}
