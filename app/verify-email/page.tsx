'use client'

import { useEffect, useRef, useState, Suspense, type ClipboardEvent, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { authService } from "@/services/AuthService"
import { validarCodigoOtp } from "@/lib/validators"

const CODE_LENGTH = 6

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""))
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [usernameValue, setUsernameValue] = useState("")

  useEffect(() => {
    const val = searchParams?.get("email")?.trim() ?? ""
    setEmail(val)
  }, [searchParams])

  useEffect(() => {
    if (typeof window === "undefined") return
    const pending = sessionStorage.getItem("pending_username")
    if (pending && pending.trim()) {
      setUsernameValue(pending.trim())
    }
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const focusInput = (index: number) => {
    inputsRef.current[index]?.focus()
    inputsRef.current[index]?.select()
  }

  const handleChange = (index: number, val: string) => {
    setError(null)
    setNotice(null)
    const sanitized = val.replace(/[^0-9]/g, "").slice(-1)
    const next = [...code]
    next[index] = sanitized
    setCode(next)

    if (sanitized && index < CODE_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      e.preventDefault()
      const next = [...code]
      next[index - 1] = ""
      setCode(next)
      focusInput(index - 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, CODE_LENGTH)
    if (!text) return
    const next = Array(CODE_LENGTH).fill("")
    for (let i = 0; i < text.length; i++) next[i] = text[i]
    setCode(next)
    focusInput(Math.min(text.length, CODE_LENGTH - 1))
  }

  const otp = code.join("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)

    if (!email) {
      setError("Falta el correo electrónico. Vuelve a crear la cuenta.")
      return
    }

    const otpErr = validarCodigoOtp(otp, CODE_LENGTH)
    if (otpErr) {
      setError(otpErr)
      return
    }

    setLoading(true)
    try {
      const { error: verifyError } = await authService.verificarCorreo(email, otp)
      if (verifyError) {
        setError(verifyError.message || "Código inválido o expirado")
        return
      }

      if (usernameValue) {
        try {
          const { data } = await authService.obtenerUsuarioActual()
          const userId = data?.user?.id
          if (userId) {
            await authService.crearPerfil(userId, usernameValue, email)
          }
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("pending_username")
          }
        } catch (err) {
          console.error("Error al crear perfil:", err)
        }
      }

      router.replace("/asesor")
    } catch (err) {
      setError("Error al verificar el código")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email || cooldown > 0 || resending) return
    setError(null)
    setNotice(null)
    setResending(true)
    try {
      const { error: resendError } = await authService.reenviarCodigo(email)
      if (resendError) {
        setError(resendError.message || "No se pudo reenviar el código")
        return
      }
      setNotice("Te enviamos un nuevo código a tu correo.")
      setCooldown(60)
    } catch (err) {
      setError("Error al reenviar el código")
      console.error(err)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="rise-in rounded-2xl border-2 border-black bg-white p-7 shadow-[6px_6px_0px_#000000] sm:p-8">
      <header>
        <div className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-black px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          <span>BECABOT · VERIFICACIÓN</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-black">
          Verifica tu correo
        </h1>
        <p className="mt-1.5 text-[13.5px] font-semibold leading-relaxed text-neutral-700">
          Introduce el código de 6 dígitos que enviamos a{" "}
          <span className="font-black text-black">{email || "tu correo"}</span>.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
        <div>
          <label className="text-[11px] font-black uppercase tracking-wider text-black">
            Código de 6 dígitos
          </label>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            {Array.from({ length: CODE_LENGTH }).map((_, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={code[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                disabled={loading}
                className="h-12 w-10 rounded-xl border-2 border-black bg-white text-center text-lg font-black text-black shadow-[2px_2px_0px_#000000] outline-none transition-all focus:shadow-[4px_4px_0px_#000000] sm:h-14 sm:w-12"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== CODE_LENGTH}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-black px-4 text-[14px] font-black text-white shadow-[4px_4px_0px_#000000] transition-all hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60"
        >
          {loading && (
            <span className="size-4 animate-spin rounded-xs border-2 border-white border-t-transparent" />
          )}
          <span>{loading ? "Verificando código…" : "Confirmar código →"}</span>
        </button>
      </form>

      {notice && (
        <div className="mt-4 rounded-xl border-2 border-black bg-neutral-100 p-3 text-[12.5px] font-bold text-black shadow-[2px_2px_0px_#000000]">
          {notice}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border-2 border-red-600 bg-red-50 p-3 text-[12.5px] font-bold text-red-700 shadow-[2px_2px_0px_#dc2626]">
          {error}
        </div>
      )}

      <div className="mt-6 border-t-2 border-black pt-4 text-center text-[13px] font-bold text-neutral-700">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0 || !email}
          className="font-black text-black underline decoration-2 underline-offset-4 hover:text-neutral-700 disabled:opacity-50"
        >
          {resending
            ? "Reenviando…"
            : cooldown > 0
              ? `Reenviar código en ${cooldown}s`
              : "Reenviar código"}
        </button>
      </div>

      <p className="mt-4 text-center text-[12.5px] font-bold text-neutral-600">
        <Link href="/signup" className="font-black text-black hover:underline">
          ← Volver al registro
        </Link>
      </p>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md flex-col justify-center px-5 py-12">
      <Suspense
        fallback={
          <div className="rounded-2xl border-2 border-black bg-white p-8 text-center text-sm font-black text-black shadow-[4px_4px_0px_#000000]">
            Cargando verificación…
          </div>
        }
      >
        <VerifyEmailForm />
      </Suspense>
    </section>
  )
}
