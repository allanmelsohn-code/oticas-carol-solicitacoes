import nodemailer from 'npm:nodemailer@6.9.7';

// Initialize Nodemailer with Gmail
const gmailUser = 'avisosoticascarol@gmail.com';
const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD');

console.log('🔑 [EMAIL INIT] Gmail user:', gmailUser);
console.log('🔑 [EMAIL INIT] Gmail password exists:', !!gmailPassword);
console.log('🔑 [EMAIL INIT] Gmail password length:', gmailPassword?.length || 0);

const transporter = gmailPassword ? nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailPassword,
  },
}) : null;

console.log('✅ [EMAIL INIT] Nodemailer transporter initialized:', !!transporter);

// Email configuration
const FROM_EMAIL = 'Óticas Carol <avisosoticascarol@gmail.com>';
const APPROVERS_EMAILS = ['monique.marinho@oticascarol.com.br', 'chris@mintaka-serv.com.br'];

interface EmailTemplate {
  to: string[];
  subject: string;
  html: string;
}

// Email Templates
export function newRequestEmail(
  storeName: string,
  type: string,
  value: number,
  osNumber: string,
  requestedBy: string,
  justification: string
): EmailTemplate {
  return {
    to: APPROVERS_EMAILS,
    subject: `🔔 Nova Solicitação - ${storeName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 32px 24px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; margin-bottom: 16px; }
            .badge-pending { background-color: #fef3c7; color: #d97706; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
            .info-item { padding: 12px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
            .info-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
            .info-value { font-size: 14px; font-weight: 600; color: #111827; }
            .value-highlight { color: #16a34a; font-size: 18px; }
            .justification { background-color: #f3f4f6; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 24px 0; }
            .button { display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin-top: 24px; }
            .footer { text-align: center; padding: 24px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Nova Solicitação Recebida</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">Uma nova solicitação precisa de sua aprovação</p>
            </div>
            <div class="content">
              <span class="badge badge-pending">Aguardando Aprovação</span>
              
              <h2 style="margin: 0 0 8px 0; font-size: 20px;">${storeName}</h2>
              <p style="margin: 0; color: #6b7280;">Solicitado por: ${requestedBy}</p>
              
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Tipo de Serviço</div>
                  <div class="info-value">${type === 'montagem' ? '🔧 Montagem' : '🏍️ Motoboy'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Número da OS</div>
                  <div class="info-value">${osNumber}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Valor</div>
                  <div class="info-value value-highlight">R$ ${value.toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Data</div>
                  <div class="info-value">${new Date().toLocaleDateString('pt-BR')}</div>
                </div>
              </div>
              
              <div class="justification">
                <div class="info-label" style="margin-bottom: 8px;">Justificativa</div>
                <p style="margin: 0; color: #374151;">${justification}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="https://deck-access-40520749.figma.site/#/approvals" class="button">
                  Ver Solicitação e Aprovar
                </a>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0;">Sistema de Gestão - Óticas Carol</p>
              <p style="margin: 8px 0 0 0; font-size: 12px;">Este é um email automático, não responda.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

export function approvedRequestEmail(
  storeName: string,
  type: string,
  value: number,
  osNumber: string,
  storeEmail: string,
  observation?: string
): EmailTemplate {
  return {
    to: [storeEmail],
    subject: `✅ Solicitação Aprovada - OS ${osNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 32px 24px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; margin-bottom: 16px; }
            .badge-approved { background-color: #dcfce7; color: #16a34a; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
            .info-item { padding: 12px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
            .info-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
            .info-value { font-size: 14px; font-weight: 600; color: #111827; }
            .observation { background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; border-radius: 8px; margin: 24px 0; }
            .footer { text-align: center; padding: 24px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
            .checkmark { font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="checkmark">✅</div>
              <h1>Solicitação Aprovada!</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">Sua solicitação foi aprovada com sucesso</p>
            </div>
            <div class="content">
              <span class="badge badge-approved">Aprovada</span>
              
              <h2 style="margin: 0 0 8px 0; font-size: 20px;">${storeName}</h2>
              
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Tipo de Serviço</div>
                  <div class="info-value">${type === 'montagem' ? '🔧 Montagem' : '🏍️ Motoboy'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Número da OS</div>
                  <div class="info-value">${osNumber}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Valor Aprovado</div>
                  <div class="info-value" style="color: #16a34a;">R$ ${value.toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Status</div>
                  <div class="info-value" style="color: #16a34a;">✓ Aprovado</div>
                </div>
              </div>
              
              ${observation ? `
              <div class="observation">
                <div class="info-label" style="margin-bottom: 8px;">Observação do Aprovador</div>
                <p style="margin: 0; color: #166534;">${observation}</p>
              </div>
              ` : ''}
              
              <p style="text-align: center; color: #6b7280; margin-top: 24px;">
                Você pode prosseguir com o serviço solicitado.
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">Sistema de Gestão - Óticas Carol</p>
              <p style="margin: 8px 0 0 0; font-size: 12px;">Este é um email automático, não responda.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

export function rejectedRequestEmail(
  storeName: string,
  type: string,
  value: number,
  osNumber: string,
  storeEmail: string,
  observation: string
): EmailTemplate {
  return {
    to: [storeEmail],
    subject: `❌ Solicitação Reprovada - OS ${osNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 32px 24px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; margin-bottom: 16px; }
            .badge-rejected { background-color: #fee2e2; color: #dc2626; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
            .info-item { padding: 12px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
            .info-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
            .info-value { font-size: 14px; font-weight: 600; color: #111827; }
            .observation { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px; margin: 24px 0; }
            .footer { text-align: center; padding: 24px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Solicitação Reprovada</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">Sua solicitação não foi aprovada</p>
            </div>
            <div class="content">
              <span class="badge badge-rejected">Reprovada</span>
              
              <h2 style="margin: 0 0 8px 0; font-size: 20px;">${storeName}</h2>
              
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Tipo de Serviço</div>
                  <div class="info-value">${type === 'montagem' ? '🔧 Montagem' : '🏍️ Motoboy'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Número da OS</div>
                  <div class="info-value">${osNumber}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Valor</div>
                  <div class="info-value">R$ ${value.toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Status</div>
                  <div class="info-value" style="color: #dc2626;">✗ Reprovado</div>
                </div>
              </div>
              
              <div class="observation">
                <div class="info-label" style="margin-bottom: 8px;">Motivo da Reprovação</div>
                <p style="margin: 0; color: #991b1b; font-weight: 500;">${observation}</p>
              </div>
              
              <p style="text-align: center; color: #6b7280; margin-top: 24px;">
                Entre em contato com a administração para mais informações.
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">Sistema de Gestão - Óticas Carol</p>
              <p style="margin: 8px 0 0 0; font-size: 12px;">Este é um email automático, não responda.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

// Send email function using Nodemailer
export async function sendEmail(template: EmailTemplate): Promise<{ success: boolean; error?: string; data?: any }> {
  console.log('📧 [EMAIL] sendEmail called');
  console.log('📧 [EMAIL] Recipients:', template.to);
  console.log('📧 [EMAIL] Subject:', template.subject);
  console.log('📧 [EMAIL] Transporter exists:', !!transporter);
  
  if (!transporter) {
    console.log('❌ [EMAIL] Nodemailer not configured - email would be sent to:', template.to);
    console.log('❌ [EMAIL] Subject:', template.subject);
    return { success: false, error: 'Gmail password not configured' };
  }

  try {
    console.log('📤 [EMAIL] Calling Nodemailer...');
    console.log('📤 [EMAIL] FROM:', FROM_EMAIL);
    console.log('📤 [EMAIL] TO:', template.to.join(', '));
    
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: template.to.join(', '),
      subject: template.subject,
      html: template.html,
    });

    console.log('✅ [EMAIL] Nodemailer response:', JSON.stringify(info, null, 2));
    return { success: true, data: info };
  } catch (error) {
    console.error('❌ [EMAIL] Exception sending email:', error);
    console.error('❌ [EMAIL] Error details:', JSON.stringify(error, null, 2));
    return { success: false, error: error.message };
  }
}