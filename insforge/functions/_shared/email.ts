/**
 * ============================================================================
 *  Envio de emails de recordatorio — MODULO PENDIENTE DE CONECTAR
 * ============================================================================
 *
 *  Estado actual: el envio NO esta implementado. Mientras no exista el secret
 *  `EMAIL_PROVIDER` en el proyecto, `enviarEmail()` lanza un error controlado
 *  ("proveedor no configurado") y el recordatorio se conserva en estado
 *  'pendiente' (sin incrementar intentos ni marcarse como 'fallido').
 *
 *  Para activarlo:
 *    1. Crear el secret con el proveedor elegido:
 *         npx -y @insforge/cli secrets add EMAIL_PROVIDER resend
 *       (valores soportados: "resend" | "sendgrid")
 *    2. Crear el secret con la credencial del proveedor:
 *         npx -y @insforge/cli secrets add RESEND_API_KEY re_xxx
 *       o
 *         npx -y @insforge/cli secrets add SENDGRID_API_KEY SG.xxx
 *    3. Completar el `case` correspondiente en `enviarEmail()` (marcado con TODO).
 *    4. (Opcional) Definir EMAIL_FROM / EMAIL_FROM_NAME para el remitente.
 */

export type DatosRecordatorio = {
  /** Email destino. */
  to: string;
  /** Nombre de la beca. */
  nombreBeca: string;
  /** Dias restantes hasta la fecha limite. */
  diasRestantes: number;
  /** Fecha limite en formato YYYY-MM-DD. */
  fechaLimite: string;
};

/** Error controlado: no hay proveedor de email configurado todavia. */
export class EmailNoConfiguradoError extends Error {
  readonly code = 'EMAIL_PROVIDER_NOT_CONFIGURED';
  constructor() {
    super('Proveedor de email no configurado');
    this.name = 'EmailNoConfiguradoError';
  }
}

export function esEmailNoConfigurado(err: unknown): boolean {
  return (
    err instanceof EmailNoConfiguradoError ||
    (err as { code?: string } | null)?.code === 'EMAIL_PROVIDER_NOT_CONFIGURED'
  );
}

/** Asunto del correo (texto fijo, sin LLM). */
export function construirAsunto(d: DatosRecordatorio): string {
  return `Recordatorio: la beca "${d.nombreBeca}" vence en ${d.diasRestantes} días`;
}

/** Cuerpo en texto plano (texto fijo en español, sin LLM). */
export function construirCuerpoTexto(d: DatosRecordatorio): string {
  return [
    'Hola,',
    '',
    `Te recordamos que la beca "${d.nombreBeca}" vence el ${d.fechaLimite} ` +
      `(en ${d.diasRestantes} días).`,
    '',
    'Si aún no has enviado tu solicitud, este es el momento de hacerlo.',
    '',
    '¡Mucho éxito!',
    'Equipo BecaBot',
  ].join('\n');
}

/** Cuerpo en HTML (mismo texto fijo, sin LLM). */
export function construirCuerpoHtml(d: DatosRecordatorio): string {
  return `<!doctype html>
<html lang="es">
  <body style="font-family: Arial, Helvetica, sans-serif; color: #1f2937; line-height: 1.6;">
    <p>Hola,</p>
    <p>
      Te recordamos que la beca <strong>${escapeHtml(d.nombreBeca)}</strong>
      vence el <strong>${escapeHtml(d.fechaLimite)}</strong>
      (en <strong>${d.diasRestantes} días</strong>).
    </p>
    <p>Si aún no has enviado tu solicitud, este es el momento de hacerlo.</p>
    <p>¡Mucho éxito!<br/>Equipo BecaBot</p>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Envia un recordatorio por email.
 *
 * Lanza `EmailNoConfiguradoError` si `EMAIL_PROVIDER` no existe.
 * Lanza cualquier otro error si el proveedor falla (lo maneja el llamador).
 */
export async function enviarEmail(d: DatosRecordatorio): Promise<void> {
  const provider = Deno.env.get('EMAIL_PROVIDER');
  if (!provider) {
    throw new EmailNoConfiguradoError();
  }

  const from = Deno.env.get('EMAIL_FROM') ?? 'recordatorios@becabot.app';
  const fromName = Deno.env.get('EMAIL_FROM_NAME') ?? 'BecaBot';
  const asunto = construirAsunto(d);
  const texto = construirCuerpoTexto(d);
  const html = construirCuerpoHtml(d);

  switch (provider) {
    case 'resend': {
      // ------------------------------------------------------------------
      // TODO(conectar Resend):
      //   const apiKey = Deno.env.get('RESEND_API_KEY');
      //   await fetch('https://api.resend.com/emails', {
      //     method: 'POST',
      //     headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ from: `${fromName} <${from}>`, to: d.to, subject: asunto, text: texto, html }),
      //   });
      // ------------------------------------------------------------------
      throw new Error(
        'Proveedor "resend" seleccionado pero aun no implementado en _shared/email.ts',
      );
    }
    case 'sendgrid': {
      // ------------------------------------------------------------------
      // TODO(conectar SendGrid):
      //   const apiKey = Deno.env.get('SENDGRID_API_KEY');
      //   await fetch('https://api.sendgrid.com/v3/mail/send', {
      //     method: 'POST',
      //     headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       personalizations: [{ to: [{ email: d.to }] }],
      //       from: { email: from, name: fromName },
      //       subject: asunto,
      //       content: [ { type: 'text/plain', value: texto }, { type: 'text/html', value: html } ],
      //     }),
      //   });
      // ------------------------------------------------------------------
      throw new Error(
        'Proveedor "sendgrid" seleccionado pero aun no implementado en _shared/email.ts',
      );
    }
    default:
      throw new Error(`Proveedor de email desconocido: ${provider}`);
  }
}
