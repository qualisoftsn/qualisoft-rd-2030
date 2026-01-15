export const getActivationEmailTemplate = (tenantName: string, planName: string, expiryDate: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; color: #1a202c; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: #0f172a; padding: 40px; text-align: center; }
    .content { padding: 40px; line-height: 1.6; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #64748b; }
    .btn { display: inline-block; padding: 14px 30px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; margin-top: 20px; }
    .plan-badge { display: inline-block; padding: 4px 12px; background: #dbeafe; color: #1e40af; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; }
    h1 { color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: -1px; }
    .highlight { color: #2563eb; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="font-style: italic;">QUALISOFT <span style="color: #3b82f6;">RD 2030</span></h1>
      <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 10px;">Management Intelligence System</p>
    </div>
    
    <div class="content">
      <div class="plan-badge">Activation Licence Élite</div>
      <h2 style="font-style: italic; text-transform: uppercase; letter-spacing: -0.5px;">Bienvenue dans le Noyau, ${tenantName}</h2>
      
      <p>Nous avons le plaisir de vous confirmer que votre paiement a été validé par notre service financier. Le <strong>Mode Lecture Seule</strong> a été levé sur votre instance.</p>
      
      <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <p style="margin: 0; font-size: 13px;"><strong>Plan activé :</strong> <span class="highlight">${planName}</span></p>
        <p style="margin: 5px 0 0 0; font-size: 13px;"><strong>Valable jusqu'au :</strong> <span class="highlight">${expiryDate}</span></p>
        <p style="margin: 5px 0 0 0; font-size: 13px;"><strong>Statut :</strong> ✨ Opérationnel</p>
      </div>

      <p>Vous avez désormais un accès total à vos modules de gestion des processus, audits, non-conformités et indicateurs de performance (SMI).</p>
      
      <div style="text-align: center;">
        <a href="https://app.qualisoft.sn/dashboard" class="btn">Accéder à mon Dashboard</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #64748b;">Besoin d'assistance ? Notre équipe support à Dakar est à votre disposition.</p>
    </div>
    
    <div class="footer">
      <p><strong>QUALISOFT RD 2030</strong><br>
      Villa 247, Cité Cheikh Hann, Route du Lac Rose, DAKAR (Sénégal)<br>
      Tél: +221 77 441 09 02 | Email: qualisoft@qualisoft.sn</p>
      <p style="margin-top: 10px;">&copy; 2026 Qualisoft Intelligence. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
`;