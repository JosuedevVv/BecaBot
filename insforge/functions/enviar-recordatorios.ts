import { json, preflight } from './_shared/http.ts';
import { adminClient, isServiceRole } from './_shared/insforge.ts';
import { enviarEmail, esEmailNoConfigurado, type DatosRecordatorio } from './_shared/email.ts';

const MS_POR_DIA = 86_400_000;

type Alerta = { id_alerta: string; id_usuario: string; id_beca: string; dias_antes: number[] };
type Recordatorio = {
  id_recordatorio: string;
  id_alerta: string;
  dias_antes: number;
  estado: string;
  intentos: number;
};

function soloFecha(valor: unknown): string {
  return String(valor ?? '').slice(0, 10);
}

async function obtenerHoyMx(admin: ReturnType<typeof adminClient>): Promise<string> {
  const { data, error } = await admin.database.rpc('hoy_mx');
  if (error) throw new Error(`hoy_mx(): ${error.message}`);
  let valor: unknown = data;
  if (Array.isArray(valor)) {
    const first = valor[0] as Record<string, unknown> | undefined;
    valor = first ? (first.hoy_mx ?? first) : undefined;
  } else if (valor && typeof valor === 'object') {
    valor = (valor as Record<string, unknown>).hoy_mx;
  }
  return soloFecha(valor);
}

export default async function (req: Request): Promise<Response> {
  const pf = preflight(req);
  if (pf) return pf;

  if (!isServiceRole(req)) {
    return json({ error: 'No autorizado: se requiere service role' }, 401);
  }

  const admin = adminClient();

  const { data: subs } = await admin.database
    .from('suscripciones')
    .select('id_usuario')
    .eq('estado', 'activa')
    .gt('fecha_fin', new Date().toISOString());
  const premium = new Set<string>((subs ?? []).map((s: { id_usuario: string }) => s.id_usuario));

  const { data: alertasRaw } = await admin.database
    .from('alertas_beca')
    .select('id_alerta,id_usuario,id_beca,dias_antes,activa')
    .eq('activa', true);
  const alertas: Alerta[] = (alertasRaw ?? []).filter((a: Alerta) =>
    premium.has(a.id_usuario),
  );

  const becasPorId = new Map<string, { name: string; fecha_expiracion: string | null }>();
  const becaIds = Array.from(new Set(alertas.map((a) => a.id_beca)));
  if (becaIds.length > 0) {
    const { data: becas } = await admin.database
      .from('becas')
      .select('id_beca,name,fecha_expiracion')
      .in('id_beca', becaIds);
    for (const b of becas ?? []) becasPorId.set(b.id_beca, b);
  }

  const alertaIds = alertas.map((a) => a.id_alerta);
  const existentes = new Set<string>();
  if (alertaIds.length > 0) {
    const { data: previos } = await admin.database
      .from('recordatorios')
      .select('id_alerta,dias_antes')
      .in('id_alerta', alertaIds);
    for (const r of previos ?? []) existentes.add(`${r.id_alerta}:${r.dias_antes}`);
  }

  const hoy = await obtenerHoyMx(admin);
  const hoyMs = Date.parse(`${hoy}T00:00:00Z`);

  const nuevas: Array<{ id_alerta: string; dias_antes: number }> = [];
  for (const alerta of alertas) {
    const beca = becasPorId.get(alerta.id_beca);
    if (!beca?.fecha_expiracion) continue;
    const expMs = Date.parse(`${soloFecha(beca.fecha_expiracion)}T00:00:00Z`);
    if (Number.isNaN(expMs) || expMs < hoyMs) continue;
    const dias = Math.round((expMs - hoyMs) / MS_POR_DIA);
    const diasAntes = Array.isArray(alerta.dias_antes) ? alerta.dias_antes : [];
    if (!diasAntes.includes(dias)) continue;
    if (existentes.has(`${alerta.id_alerta}:${dias}`)) continue;
    nuevas.push({ id_alerta: alerta.id_alerta, dias_antes: dias });
  }

  let generados = 0;
  if (nuevas.length > 0) {
    const { data, error } = await admin.database
      .from('recordatorios')
      .insert(nuevas)
      .select();
    if (error) {
      console.log(`[enviar-recordatorios] insercion de recordatorios: ${error.message}`);
    } else {
      generados = (data ?? []).length;
    }
  }

  const { data: pendientesRaw } = await admin.database
    .from('recordatorios')
    .select('id_recordatorio,id_alerta,dias_antes,estado,intentos')
    .eq('estado', 'pendiente');
  const { data: fallidosRaw } = await admin.database
    .from('recordatorios')
    .select('id_recordatorio,id_alerta,dias_antes,estado,intentos')
    .eq('estado', 'fallido')
    .lt('intentos', 3);

  const aProcesar: Recordatorio[] = [...(pendientesRaw ?? []), ...(fallidosRaw ?? [])];

  let enviados = 0;
  let fallidos = 0;

  for (const rec of aProcesar) {
    const { data: alertaRows } = await admin.database
      .from('alertas_beca')
      .select('id_alerta,id_usuario,id_beca')
      .eq('id_alerta', rec.id_alerta)
      .limit(1);
    const alerta = alertaRows?.[0];
    if (!alerta) continue;

    const { data: becaRows } = await admin.database
      .from('becas')
      .select('name,fecha_expiracion')
      .eq('id_beca', alerta.id_beca)
      .limit(1);
    const beca = becaRows?.[0];

    const { data: userRows } = await admin.database
      .from('usuarios')
      .select('email')
      .eq('id_usuario', alerta.id_usuario)
      .limit(1);
    const to = userRows?.[0]?.email;

    if (!beca || !to) {
      const detalle = !beca ? 'beca no encontrada' : 'usuario sin email';
      await admin.database
        .from('recordatorios')
        .update({ estado: 'fallido', intentos: (rec.intentos ?? 0) + 1, error: detalle })
        .eq('id_recordatorio', rec.id_recordatorio);
      fallidos += 1;
      continue;
    }

    const datos: DatosRecordatorio = {
      to,
      nombreBeca: beca.name,
      diasRestantes: rec.dias_antes,
      fechaLimite: soloFecha(beca.fecha_expiracion),
    };

    try {
      await enviarEmail(datos);
      await admin.database
        .from('recordatorios')
        .update({ estado: 'enviado', fecha_envio: new Date().toISOString(), error: null })
        .eq('id_recordatorio', rec.id_recordatorio);
      enviados += 1;
    } catch (err) {
      if (esEmailNoConfigurado(err)) {
        console.log(
          `[enviar-recordatorios] proveedor de email no configurado; ` +
            `recordatorio ${rec.id_recordatorio} permanece pendiente`,
        );
      } else {
        await admin.database
          .from('recordatorios')
          .update({
            estado: 'fallido',
            intentos: (rec.intentos ?? 0) + 1,
            error: String((err as Error)?.message ?? err),
          })
          .eq('id_recordatorio', rec.id_recordatorio);
        fallidos += 1;
      }
    }
  }

  const { data: pendientesTotales } = await admin.database
    .from('recordatorios')
    .select('id_recordatorio')
    .eq('estado', 'pendiente');
  const pendientes = (pendientesTotales ?? []).length;

  return json({ generados, enviados, pendientes, fallidos });
}
