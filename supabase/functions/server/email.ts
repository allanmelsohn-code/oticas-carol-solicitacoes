// supabase/functions/server/email.ts
import { Resend } from 'npm:resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') ?? '');
// Use RESEND_FROM env var se configurado (domínio verificado), senão usa o domínio de teste do Resend
const FROM = Deno.env.get('RESEND_FROM') ?? 'Óticas Carol <onboarding@resend.dev>';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RequestEmailData {
  id: string;
  storeName: string;
  type: string;
  value: number;
  osNumber: string;
  date: string;
  justification: string;
  chargedToClient: boolean;
  requestedBy: string;
}

const TYPE_LABELS: Record<string, string> = {
  montagem: 'Montagem',
  motoboy: 'Motoboy',
  sedex: 'Sedex',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function baseTemplate(title: string, headerColor: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:32px auto;background:white;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:${headerColor};padding:16px 20px">
      <div style="color:white;font-size:13px;font-weight:700">Óticas Carol</div>
      <div style="color:rgba(255,255,255,.7);font-size:11px;margin-top:2px">${title}</div>
    </div>
    <div style="padding:20px">${bodyHtml}</div>
    <div style="padding:12px 20px;border-top:1px solid #f3f4f6;font-size:10px;color:#9ca3af">
      Óticas Carol · Sistema de Gestão · não responda este e-mail
    </div>
  </div>
</body></html>`;
}

function requestDetailsTable(req: RequestEmailData): string {
  const rows: [string, string][] = [
    ['Loja', req.storeName],
    ['Tipo', TYPE_LABELS[req.type] ?? req.type],
    ['Valor', formatCurrency(req.value)],
    ['OS', `#${req.osNumber}`],
    ['Data', req.date],
    ['Solicitante', req.requestedBy],
    ['Cobrado do cliente', req.chargedToClient ? 'Sim' : 'Não'],
  ];
  const trs = rows.map(([k, v]) => `
    <tr>
      <td style="padding:6px 10px;font-size:11px;color:#6b7280;border-bottom:1px solid #f9fafb">${k}</td>
      <td style="padding:6px 10px;font-size:11px;color:#111827;font-weight:500;border-bottom:1px solid #f9fafb">${v}</td>
    </tr>`).join('');
  return `<table width="100%" style="background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;border-collapse:collapse;margin-bottom:16px">${trs}</table>`;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export async function sendNewRequestEmail(req: RequestEmailData, approverEmail: string): Promise<void> {
  const body = `
    <p style="font-size:13px;color:#374151;margin-bottom:12px">
      Uma nova solicitação aguarda sua aprovação:
    </p>
    ${requestDetailsTable(req)}
    <p style="font-size:11px;color:#6b7280;font-style:italic;margin-bottom:16px">"${req.justification}"</p>
    <a href="${Deno.env.get('APP_URL') ?? 'https://oticascarol.app'}"
       style="display:inline-block;background:#111827;color:white;font-size:11px;font-weight:600;padding:9px 16px;border-radius:6px;text-decoration:none">
      Revisar e Aprovar →
    </a>`;

  await resend.emails.send({
    from: FROM,
    to: approverEmail,
    subject: `Nova solicitação — ${req.storeName} · ${TYPE_LABELS[req.type] ?? req.type}`,
    html: baseTemplate('Nova solicitação aguarda aprovação', '#111827', body),
  });
}

export async function sendApprovedEmail(req: RequestEmailData, requesterEmail: string, approverName: string): Promise<void> {
  const body = `
    <p style="font-size:13px;color:#374151;margin-bottom:12px">
      Sua solicitação foi <strong style="color:#166534">aprovada</strong> por ${approverName}:
    </p>
    ${requestDetailsTable(req)}
    <a href="${Deno.env.get('APP_URL') ?? 'https://oticascarol.app'}"
       style="display:inline-block;background:#111827;color:white;font-size:11px;font-weight:600;padding:9px 16px;border-radius:6px;text-decoration:none">
      Ver Solicitação →
    </a>`;

  await resend.emails.send({
    from: FROM,
    to: requesterEmail,
    subject: `Solicitação aprovada ✓ — OS #${req.osNumber}`,
    html: baseTemplate('Solicitação aprovada', '#16a34a', body),
  });
}

export async function sendRejectedEmail(
  req: RequestEmailData,
  requesterEmail: string,
  approverName: string,
  reason: string,
): Promise<void> {
  const body = `
    <p style="font-size:13px;color:#374151;margin-bottom:12px">
      Sua solicitação foi <strong style="color:#991b1b">reprovada</strong> por ${approverName}:
    </p>
    ${requestDetailsTable(req)}
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:10px 12px;margin-bottom:16px">
      <div style="font-size:10px;font-weight:700;color:#dc2626;margin-bottom:4px">Motivo da reprovação:</div>
      <div style="font-size:11px;color:#991b1b">${reason}</div>
    </div>
    <a href="${Deno.env.get('APP_URL') ?? 'https://oticascarol.app'}"
       style="display:inline-block;background:#dc2626;color:white;font-size:11px;font-weight:600;padding:9px 16px;border-radius:6px;text-decoration:none">
      Ver Solicitação →
    </a>`;

  await resend.emails.send({
    from: FROM,
    to: requesterEmail,
    subject: `Solicitação reprovada — OS #${req.osNumber}`,
    html: baseTemplate('Solicitação reprovada', '#dc2626', body),
  });
}
