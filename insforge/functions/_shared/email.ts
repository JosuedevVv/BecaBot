
export type DatosRecordatorio = {
  to: string;
  nombreBeca: string;
  diasRestantes: number;
  fechaLimite: string;
};

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

export function construirAsunto(d: DatosRecordatorio): string {
  return `Recordatorio: la beca "${d.nombreBeca}" vence en ${d.diasRestantes} días`;
}

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
      throw new Error(
        'Proveedor "resend" seleccionado pero aun no implementado en _shared/email.ts',
      );
    }
    case 'sendgrid': {
      throw new Error(
        'Proveedor "sendgrid" seleccionado pero aun no implementado en _shared/email.ts',
      );
    }
    default:
      throw new Error(`Proveedor de email desconocido: ${provider}`);
  }
}
