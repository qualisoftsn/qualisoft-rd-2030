/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 📧 TEMPLATE : Invoice Email
 * RÔLE : Template HTML pour les emails de factures
 */

export interface InvoiceEmailData {
  tenantName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  paymentLink?: string;
  supportEmail: string;
}

export function getInvoiceEmailTemplate(data: InvoiceEmailData): string {
  const {
    tenantName,
    invoiceNumber,
    invoiceDate,
    dueDate,
    amount,
    currency,
    items,
    paymentLink,
    supportEmail,
  } = data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: currency || 'XOF',
    }).format(amount);
  };

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">QUALISOFT ELITE</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Facture ${invoiceNumber}</p>
            </td>
          </tr>
          
          <!-- CONTENT -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; margin: 0 0 20px 0;">Bonjour <strong>${tenantName}</strong>,</p>
              
              <p style="color: #666666; font-size: 14px; margin: 0 0 30px 0; line-height: 1.6;">
                Veuillez trouver ci-dessous le détail de votre facture pour la période en cours. 
                Le paiement est attendu avant le <strong>${dueDate}</strong>.
              </p>
              
              <!-- TABLEAU DES ITEMS -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <th style="background-color: #f8f9fa; padding: 12px; text-align: left; font-size: 12px; color: #666666; border-bottom: 2px solid #e9ecef;">Description</th>
                  <th style="background-color: #f8f9fa; padding: 12px; text-align: center; font-size: 12px; color: #666666; border-bottom: 2px solid #e9ecef;">Qté</th>
                  <th style="background-color: #f8f9fa; padding: 12px; text-align: right; font-size: 12px; color: #666666; border-bottom: 2px solid #e9ecef;">Prix Unit.</th>
                  <th style="background-color: #f8f9fa; padding: 12px; text-align: right; font-size: 12px; color: #666666; border-bottom: 2px solid #e9ecef;">Total</th>
                </tr>
                ${items.map(item => `
                <tr>
                  <td style="padding: 12px; font-size: 14px; color: #333333; border-bottom: 1px solid #e9ecef;">${item.description}</td>
                  <td style="padding: 12px; font-size: 14px; color: #333333; text-align: center; border-bottom: 1px solid #e9ecef;">${item.quantity}</td>
                  <td style="padding: 12px; font-size: 14px; color: #333333; text-align: right; border-bottom: 1px solid #e9ecef;">${formatCurrency(item.unitPrice)}</td>
                  <td style="padding: 12px; font-size: 14px; color: #333333; text-align: right; border-bottom: 1px solid #e9ecef;">${formatCurrency(item.total)}</td>
                </tr>
                `).join('')}
                <tr>
                  <td colspan="3" style="padding: 15px 12px; font-size: 16px; font-weight: bold; color: #1e40af; text-align: right; border-top: 2px solid #1e40af;">TOTAL TTC</td>
                  <td style="padding: 15px 12px; font-size: 18px; font-weight: bold; color: #1e40af; text-align: right; border-top: 2px solid #1e40af;">${formatCurrency(amount)}</td>
                </tr>
              </table>
              
              <!-- BOUTON DE PAIEMENT -->
              ${paymentLink ? `
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${paymentLink}" style="background-color: #3b82f6; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold; display: inline-block;">
                      Payer ma facture
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- INFO PAIEMENT -->
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-top: 30px;">
                <p style="color: #666666; font-size: 13px; margin: 0 0 10px 0;"><strong>📅 Date d'émission :</strong> ${invoiceDate}</p>
                <p style="color: #666666; font-size: 13px; margin: 0 0 10px 0;"><strong>⏰ Date limite :</strong> ${dueDate}</p>
                <p style="color: #666666; font-size: 13px; margin: 0;"><strong>💳 Moyens de paiement :</strong> Virement bancaire, Mobile Money, Carte bancaire</p>
              </div>
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0 0 10px 0;">
                Une question ? Contactez-nous à <a href="mailto:${supportEmail}" style="color: #3b82f6; text-decoration: none;">${supportEmail}</a>
              </p>
              <p style="color: #999999; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} Qualisoft Elite. Tous droits réservés.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}