import { insforgeAdmin } from "@/lib/insforge-admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, action, days = 30 } = body;

    if (!userId) {
      return Response.json({ error: "userId es obligatorio" }, { status: 400 });
    }

    if (action === "activate") {
      await insforgeAdmin.database
        .from("suscripciones")
        .update({ estado: "cancelada" })
        .eq("id_usuario", userId)
        .eq("estado", "activa");

      const fechaFin = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await insforgeAdmin.database
        .from("suscripciones")
        .insert([
          {
            id_usuario: userId,
            estado: "activa",
            fecha_fin: fechaFin,
            precio_aplicado: 49.0,
            moneda: "MXN",
          },
        ])
        .select()
        .single();

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      return Response.json({ ok: true, esPremium: true, suscripcion: data });
    }

    if (action === "deactivate") {
      const { error } = await insforgeAdmin.database
        .from("suscripciones")
        .update({
          estado: "cancelada",
          fecha_fin: new Date(Date.now() - 1000).toISOString(),
        })
        .eq("id_usuario", userId)
        .eq("estado", "activa");

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      return Response.json({ ok: true, esPremium: false });
    }

    return Response.json({ error: "Acción no válida" }, { status: 400 });
  } catch (err: any) {
    return Response.json({ error: err.message || "Error interno" }, { status: 500 });
  }
}
