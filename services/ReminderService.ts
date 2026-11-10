import { authService } from './AuthService'
import { subscriptionService } from './SubscriptionService'

export type ResultadoRecordatorioChat = {
  exito: boolean
  mensaje: string
  requiereAuth?: boolean
  requierePremium?: boolean
  datosAlerta?: {
    nombreBeca: string
    fechaExpiracion?: string
    diasAntes: number[]
  }
}

export const reminderService = {
  async procesarSolicitudEnChat(nombreBeca?: string): Promise<ResultadoRecordatorioChat> {
    const { data } = await authService.obtenerUsuarioActual()
    if (!data?.user?.id) {
      return {
        exito: false,
        requiereAuth: true,
        mensaje:
          '🔒 **Para agendar recordatorios automáticos necesitas tener una cuenta activa con Plan Premium.**\n\n' +
          'En modo invitado no es posible guardar alertas en tu perfil ni recibir avisos por correo. ' +
          'Por favor [Inicia sesión aquí](/login) o [Crea tu cuenta](/signup) y activa tu suscripción en [Planes Premium](/premium).',
      }
    }

    const userId = data.user.id

    const { esPremium } = await subscriptionService.obtenerEstadoSuscripcion()
    if (!esPremium) {
      return {
        exito: false,
        requierePremium: true,
        mensaje:
          '⭐ **Esta función es exclusiva del Plan Premium.**\n\n' +
          'Tu cuenta actual tiene el **Plan Becario Gratuito**, el cual incluye consultas ilimitadas pero no alertas automáticas de fechas límite.\n\n' +
          'Con **BecaBot Premium ($49 MXN/mes)** recibirás avisos directos a tu correo con 30, 7 y 1 día de anticipación antes del cierre de recepción de documentos.\n\n' +
          '👉 [Activar BecaBot Premium aquí](/premium) para comenzar a monitorear tus becas.',
      }
    }

    const nombreObjetivo = (nombreBeca || '').trim()
    if (!nombreObjetivo) {
      return {
        exito: false,
        mensaje:
          '⚠️ No pude identificar con certeza para qué beca deseas el recordatorio. ' +
          'Por favor indícame el nombre, por ejemplo: *"Hazme un recordatorio para la Beca Benito Juárez"* o *"Recuérdame la convocatoria Jóvenes Escribiendo el Futuro"*.',
      }
    }

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          nombreBeca: nombreObjetivo,
        }),
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        if (json.error === 'PREMIUM_REQUIRED') {
          return {
            exito: false,
            requierePremium: true,
            mensaje:
              '⭐ **Esta función es exclusiva del Plan Premium.** Activa tu suscripción en [Planes Premium](/premium).',
          }
        }
        return {
          exito: false,
          mensaje: `No fue posible agendar el recordatorio: ${json.error || 'error en servidor'}`,
        }
      }

      const fechaExp = json.fechaExpiracion || 'Por confirmar en convocatoria oficial'
      return {
        exito: true,
        datosAlerta: {
          nombreBeca: json.nombreBeca,
          fechaExpiracion: json.fechaExpiracion,
          diasAntes: json.diasAntes || [30, 7, 1],
        },
        mensaje:
          `✅ **¡Recordatorio agendado exitosamente en tu Perfil Premium!**\n\n` +
          `• **Beca:** ${json.nombreBeca}\n` +
          `• **Fecha de cierre prevista:** ${fechaExp}\n` +
          `• **Alertas programadas a tu correo:** 30 días, 7 días y 24 horas antes del vencimiento.\n\n` +
          `Puedes consultar y gestionar tus alertas activas en cualquier momento desde tu [Expediente en Mi Perfil](/profile).`,
      }
    } catch (e: any) {
      console.error('Error procesando recordatorio en chat:', e)
      return {
        exito: false,
        mensaje: `Ocurrió un error al agendar tu recordatorio: ${e.message || 'error interno'}`,
      }
    }
  },
}
