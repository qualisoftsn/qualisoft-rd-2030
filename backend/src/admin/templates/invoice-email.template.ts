/**
 * Template HTML pour l'envoi de la facture finale acquittée
 * @param tenantName Nom de l'entreprise cliente
 * @param amount Montant total payé (formaté en XOF)
 */
export const getInvoiceEmailTemplate = (tenantName: string, amount: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
    .wrapper { padding: 40px 10px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
    .header { background: #1d4ed8; padding: 40px; text-align: center; color: #ffffff; }
    .content { padding: 40px; line-height: 1.6; }
    .badge { display: inline-block; padding: 6px 16px; background: #dcfce7; color: #166534; border-radius: 99px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 20px; }
    .amount-box { background: #f1f5f9; padding: 25px; border-radius: 16px; text-align: center; margin: 30px 0; border: 1px solid #e2e8f0; }
    .amount-val { font-size: 28px; font-weight: 900; color: #1d4ed8; display: block; }
    .btn { display: inline-block; padding: 16px 32px; background-color: #1d4ed8; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 13px; margin-top: 25px; }
    .footer { padding: 30px; text-align: center; font-size: 11px; color: #64748b; background: #f8fafc; border-top: 1px solid #e2e8f0; }
    h1 { margin: 0; font-size: 22px; letter-spacing: -0.5px; font-style: italic; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>QUALISOFT <span style="color: #93c5fd;">RD 2030</span></h1>
        <p style="font-size: 12px; text-transform: uppercase; opacity: 0.8; margin-top: 8px; letter-spacing: 1px;">Facturation & Activation Élite</p>
      </div>
      
      <div class="content">
        <div class="badge">Paiement Reçu & Validé</div>
        <h2 style="font-size: 20px; margin-bottom: 15px;">Merci de votre confiance, ${tenantName}</h2>
        
        <p>Nous vous confirmons que votre règlement a été traité avec succès par notre service financier à Dakar. Votre licence d'exploitation est désormais **active pour une durée de 24 mois**.</p>
        
        <div class="amount-box">
          <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Montant Total Acquitté</span>
          <span class="amount-val">${amount} XOF TTC</span>
        </div>

        <p>Veuillez trouver ci-joint votre <strong>facture finale acquittée</strong> au format PDF pour votre comptabilité. Ce document certifie votre accès complet au Noyau Qualisoft.</p>
        
        <div style="text-align: center;">
          <a href="https://app.qualisoft.sn/dashboard" class="btn">Accéder à mon Instance Élite</a>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>QUALISOFT RD 2030 - Intelligence QSE</strong><br>
        Villa 247, Cité Cheikh Hann, Route du Lac Rose, DAKAR (Sénégal)<br>
        Support Master : +221 77 441 09 02 | qualisoft@qualisoft.sn</p>
        <p style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">&copy; 2026 Qualisoft. Tous droits réservés.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
