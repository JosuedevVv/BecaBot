import { NextResponse } from 'next/server'
import { insforgeAdmin } from '@/lib/insforge-admin'
import { generarTituloConversacion } from '@/lib/chat-title'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const idConversacion = searchParams.get('idConversacion')

    if (idConversacion) {
      const { data, error } = await insforgeAdmin.database
        .from('mensajes')
        .select('id_mensaje, id_conversacion, mensaje, tipo, created_at')
        .eq('id_conversacion', idConversacion)
        .order('created_at', { ascending: true })

      if (error) {
        return NextResponse.json({ error: error.message, items: [] }, { status: 500 })
      }
      return NextResponse.json({ items: data ?? [] })
    }

    if (userId) {
      const { data, error } = await insforgeAdmin.database
        .from('conversaciones')
        .select('id_conversacion, title, fecha, created_at')
        .eq('id_usuario', userId)
        .order('fecha', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message, items: [] }, { status: 500 })
      }
      return NextResponse.json({ items: data ?? [] })
    }

    return NextResponse.json({ items: [] })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Error al consultar historial', items: [] },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    if (action === 'crear_conversacion') {
      const { userId, primeraPregunta } = body
      if (!userId || !primeraPregunta) {
        return NextResponse.json(
          { error: 'Faltan datos para crear la conversación' },
          { status: 400 }
        )
      }

      const title = generarTituloConversacion(primeraPregunta)
      const ahora = new Date().toISOString()

      const { data, error } = await insforgeAdmin.database
        .from('conversaciones')
        .insert([{ id_usuario: userId, title, fecha: ahora }])
        .select('id_conversacion')
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: error?.message ?? 'No se pudo crear la conversación' },
          { status: 500 }
        )
      }

      return NextResponse.json({ id_conversacion: data.id_conversacion })
    }

    if (action === 'guardar_mensajes') {
      const { idConversacion, pregunta, respuesta } = body
      if (!idConversacion || !pregunta || !respuesta) {
        return NextResponse.json(
          { error: 'Faltan datos para guardar los mensajes' },
          { status: 400 }
        )
      }

      const ahoraUsuario = new Date().toISOString()
      const ahoraAsistente = new Date(Date.now() + 10).toISOString()

      const { error: msgErr } = await insforgeAdmin.database.from('mensajes').insert([
        {
          id_conversacion: idConversacion,
          mensaje: pregunta,
          tipo: 'user',
          created_at: ahoraUsuario,
        },
        {
          id_conversacion: idConversacion,
          mensaje: respuesta,
          tipo: 'assistant',
          created_at: ahoraAsistente,
        },
      ])

      if (msgErr) {
        return NextResponse.json({ error: msgErr.message, ok: false }, { status: 500 })
      }

      await insforgeAdmin.database
        .from('conversaciones')
        .update({ fecha: ahoraAsistente })
        .eq('id_conversacion', idConversacion)

      return NextResponse.json({ ok: true })
    }

    if (action === 'eliminar_conversacion') {
      const { idConversacion } = body
      if (!idConversacion) {
        return NextResponse.json({ error: 'Falta idConversacion' }, { status: 400 })
      }

      const { error } = await insforgeAdmin.database
        .from('conversaciones')
        .delete()
        .eq('id_conversacion', idConversacion)

      if (error) {
        return NextResponse.json({ error: error.message, ok: false }, { status: 500 })
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Error interno en /api/chat-history' },
      { status: 500 }
    )
  }
}
