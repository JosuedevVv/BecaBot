import { insforgeAdmin } from "@/lib/insforge-admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, nombreBeca } = body;

    if (!userId) {
      return Response.json({ error: "Usuario no autenticado" }, { status: 401 });
    }

    const nombreObjetivo = (nombreBeca || "").trim();
    if (!nombreObjetivo) {
      return Response.json(
        { error: "El nombre de la beca es obligatorio" },
        { status: 400 }
      );
    }

    const { data: rpcPrem } = await insforgeAdmin.database.rpc("es_premium", {
      uid: userId,
    });
    if (!rpcPrem) {
      return Response.json(
        { error: "PREMIUM_REQUIRED", message: "Esta función es exclusiva del Plan Premium" },
        { status: 403 }
      );
    }

    let idBeca: string | null = null;
    let fechaExp: string | null = null;
    let nombreFinal = nombreObjetivo;

    const { data: becasEncontradas } = await insforgeAdmin.database
      .from("becas")
      .select("id_beca, name, fecha_expiracion")
      .ilike("name", `%${nombreObjetivo}%`)
      .limit(1);

    if (becasEncontradas && becasEncontradas.length > 0) {
      idBeca = becasEncontradas[0].id_beca;
      nombreFinal = becasEncontradas[0].name;
      fechaExp = becasEncontradas[0].fecha_expiracion;
    } else {
      const { data: todasBecas } = await insforgeAdmin.database
        .from("becas")
        .select("id_beca, name, fecha_expiracion")
        .limit(30);

      const match = todasBecas?.find(
        (b: any) =>
          nombreObjetivo.toLowerCase().includes(b.name.toLowerCase()) ||
          b.name.toLowerCase().includes(nombreObjetivo.toLowerCase())
      );

      if (match) {
        idBeca = match.id_beca;
        nombreFinal = match.name;
        fechaExp = match.fecha_expiracion;
      } else {
        const { data: nuevaBeca, error: errBeca } = await insforgeAdmin.database
          .from("becas")
          .insert([
            {
              name: nombreObjetivo,
              description: "Registrada por solicitud de recordatorio en el chat",
              grado_academico: "General",
              fecha_expiracion: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            },
          ])
          .select("id_beca, name, fecha_expiracion")
          .single();

        if (errBeca || !nuevaBeca) {
          return Response.json(
            { error: errBeca?.message || "No se pudo registrar la beca" },
            { status: 500 }
          );
        }

        idBeca = nuevaBeca.id_beca;
        nombreFinal = nuevaBeca.name;
        fechaExp = nuevaBeca.fecha_expiracion;
      }
    }

    const { data: postExistente } = await insforgeAdmin.database
      .from("postulaciones")
      .select("id_postulacion")
      .eq("id_usuario", userId)
      .eq("id_beca", idBeca)
      .maybeSingle();

    if (postExistente?.id_postulacion) {
      await insforgeAdmin.database
        .from("postulaciones")
        .update({
          estado: "pendiente",
          notas: "Recordatorio agendado desde el Asesor IA",
        })
        .eq("id_postulacion", postExistente.id_postulacion);
    } else {
      await insforgeAdmin.database.from("postulaciones").insert([
        {
          id_usuario: userId,
          id_beca: idBeca,
          estado: "pendiente",
          notas: "Recordatorio agendado desde el Asesor IA",
        },
      ]);
    }

    const { data: alertaExistente } = await insforgeAdmin.database
      .from("alertas_beca")
      .select("id_alerta")
      .eq("id_usuario", userId)
      .eq("id_beca", idBeca)
      .maybeSingle();

    let idAlertaFinal: string | null = alertaExistente?.id_alerta ?? null;

    if (idAlertaFinal) {
      const { error: errUpdateAlerta } = await insforgeAdmin.database
        .from("alertas_beca")
        .update({
          dias_antes: [30, 7, 1],
          canal: "email",
          activa: true,
        })
        .eq("id_alerta", idAlertaFinal);

      if (errUpdateAlerta) {
        return Response.json({ error: errUpdateAlerta.message }, { status: 500 });
      }
    } else {
      const { data: nuevaAlerta, error: errInsertAlerta } = await insforgeAdmin.database
        .from("alertas_beca")
        .insert([
          {
            id_usuario: userId,
            id_beca: idBeca,
            dias_antes: [30, 7, 1],
            canal: "email",
            activa: true,
          },
        ])
        .select("id_alerta")
        .single();

      if (errInsertAlerta) {
        return Response.json({ error: errInsertAlerta.message }, { status: 500 });
      }

      idAlertaFinal = nuevaAlerta?.id_alerta ?? null;
    }

    return Response.json({
      ok: true,
      idAlerta: idAlertaFinal,
      idBeca,
      nombreBeca: nombreFinal,
      fechaExpiracion: fechaExp,
      diasAntes: [30, 7, 1],
    });
  } catch (err: any) {
    return Response.json({ error: err.message || "Error interno" }, { status: 500 });
  }
}
