'use client'

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authService } from "@/services/AuthService"
import { validarEmail, validarPassword } from "@/lib/validators"

type FieldErrors = {
  email?: string
  password?: string
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice(null)

    const emailErr = validarEmail(email)
    const passErr = validarPassword(password, 1)

    const next: FieldErrors = {}
    if (emailErr) next.email = emailErr
    if (passErr) next.password = passErr

    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      const { error } = await authService.iniciarSesion(email, password)
      if (error) {
        const msg = error.message || "No se pudo iniciar sesión"
        if (/email.*not.*verified|not.*confirmed|unverified|verification/i.test(msg)) {
          setNotice("Tu correo aún no está verificado. Introduce el código que te enviamos.")
          router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`)
          return
        }
        setNotice(msg)
        return
      }
      router.push("/asesor")
    } catch (e) {
      setNotice("Error al iniciar sesión")
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md flex-col justify-center px-5 py-12">
      <div className="rise-in rounded-2xl border-2 border-black bg-white p-7 shadow-[6px_6px_0px_#000000] sm:p-8">
        <header>
          <div className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-black px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span>BECABOT · ACCESO</span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-black">
            Inicia sesión
          </h1>
          <p className="mt-1.5 text-[13.5px] font-semibold leading-relaxed text-neutral-700">
            Guarda tus consultas de becas y recibe alertas de fechas límite en México.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[11px] font-black uppercase tracking-wider text-black"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              disabled={loading}
              placeholder="tu@correo.mx"
              className={`h-12 w-full rounded-xl border-2 bg-white px-3.5 text-[14.5px] font-bold text-black outline-none transition-all placeholder:font-medium placeholder:text-neutral-400 focus:shadow-[4px_4px_0px_#000000] ${
                errors.email
                  ? "border-red-600 shadow-[2px_2px_0px_#dc2626]"
                  : "border-black shadow-[2px_2px_0px_#000000]"
              }`}
            />
            {errors.email && (
              <p className="text-[12px] font-bold text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[11px] font-black uppercase tracking-wider text-black"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              disabled={loading}
              placeholder="••••••••"
              className={`h-12 w-full rounded-xl border-2 bg-white px-3.5 text-[14.5px] font-bold text-black outline-none transition-all placeholder:font-medium placeholder:text-neutral-400 focus:shadow-[4px_4px_0px_#000000] ${
                errors.password
                  ? "border-red-600 shadow-[2px_2px_0px_#dc2626]"
                  : "border-black shadow-[2px_2px_0px_#000000]"
              }`}
            />
            {errors.password && (
              <p className="text-[12px] font-bold text-red-600">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-black px-4 text-[14px] font-black text-white shadow-[4px_4px_0px_#000000] transition-all hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60"
          >
            {loading && (
              <span className="size-4 animate-spin rounded-xs border-2 border-white border-t-transparent" />
            )}
            <span>{loading ? "Entrando a tu cuenta…" : "Entrar a BecaBot →"}</span>
          </button>
        </form>

        {notice && (
          <div className="mt-4 rounded-xl border-2 border-black bg-neutral-100 p-3 text-[12.5px] font-bold text-black shadow-[2px_2px_0px_#000000]">
            {notice}
          </div>
        )}

        <p className="mt-6 border-t-2 border-black pt-4 text-center text-[13px] font-bold text-neutral-700">
          ¿Aún no tienes cuenta?{" "}
          <Link
            href="/signup"
            className="font-black text-black underline decoration-2 underline-offset-4 hover:text-neutral-700"
          >
            Crear cuenta gratis
          </Link>
        </p>
      </div>
    </section>
  )
}
