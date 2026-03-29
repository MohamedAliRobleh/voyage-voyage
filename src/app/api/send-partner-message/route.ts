import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const smtpPort = Number(process.env.OVH_SMTP_PORT) || 465;
const transporter = nodemailer.createTransport({
  host: process.env.OVH_SMTP_HOST || "ssl0.ovh.net",
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.OVH_SMTP_USER,
    pass: process.env.OVH_SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.OVH_SMTP_USER || "contact@voyagevoyagedj.com";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://voyagevoyagedj.com";

function fmtMoney(n: number) {
  return `${Number(n).toLocaleString("fr-FR")} FDJ`;
}

export async function POST(req: NextRequest) {
  try {
    const { reversement, partenaire } = await req.json();
    if (!reversement || !partenaire) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const commissionLabel = reversement.unite === "%" ? `${reversement.valeur}%` : fmtMoney(reversement.valeur);

    const whatsappText =
      `Bonjour ${partenaire.nom} 👋\n\n` +
      `Le voyage de *${reversement.client_nom}* à *${reversement.site_nom}* est clôturé.\n\n` +
      `📋 Facture : *${reversement.facture_numero}*\n` +
      `💰 Total encaissé : *${fmtMoney(reversement.total_client)}*\n` +
      `🤝 Votre part (${commissionLabel}) : *${fmtMoney(reversement.montant_reverser)}*\n\n` +
      `Merci pour votre collaboration !\n\n` +
      `*L'équipe Voyage Voyage* 🌍\n📞 +253 77 07 33 77`;

    // Email
    let emailSent = false;
    if (partenaire.email) {
      const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:520px;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:linear-gradient(135deg,#0e2d38,#408398);padding:24px 32px;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td><img src="${BASE_URL}/images/pics/logo/logovoyage.webp" width="44" height="44" alt="" style="border-radius:50%;background:white;padding:3px;display:block;"/></td>
          <td style="padding-left:12px;"><p style="margin:0;font-size:16px;font-weight:900;color:white;letter-spacing:2px;text-transform:uppercase;">VOYAGE VOYAGE</p><p style="margin:2px 0 0;font-size:10px;color:rgba(255,255,255,0.6);">Agence de Tourisme — Djibouti</p></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:28px 32px;">
        <p style="margin:0 0 6px;font-size:20px;font-weight:900;color:#0e2d38;">Clôture de voyage 🤝</p>
        <p style="margin:0 0 24px;font-size:14px;color:#666;">Bonjour <strong>${partenaire.nom}</strong>,</p>
        <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.7;">
          Le voyage suivant est officiellement clôturé. Voici le récapitulatif de votre commission :
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f9fb;border-radius:12px;border-left:4px solid #408398;margin-bottom:24px;">
          <tr><td style="padding:18px 20px;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;color:#408398;letter-spacing:1px;">Récapitulatif</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#444;">
              <tr><td style="padding:3px 0;">Client</td><td style="text-align:right;font-weight:700;color:#0e2d38;">${reversement.client_nom}</td></tr>
              <tr><td style="padding:3px 0;">Destination</td><td style="text-align:right;font-weight:700;color:#0e2d38;">${reversement.site_nom}</td></tr>
              <tr><td style="padding:3px 0;">Facture</td><td style="text-align:right;font-weight:700;color:#0e2d38;">${reversement.facture_numero}</td></tr>
              <tr><td style="padding:3px 0;">Total encaissé</td><td style="text-align:right;font-weight:700;color:#0e2d38;">${fmtMoney(reversement.total_client)}</td></tr>
              <tr><td style="padding:3px 0;border-top:1px solid #dde;"><strong>Votre part (${commissionLabel})</strong></td><td style="text-align:right;font-size:16px;font-weight:900;color:#408398;border-top:1px solid #dde;">${fmtMoney(reversement.montant_reverser)}</td></tr>
            </table>
          </td></tr>
        </table>
        <p style="margin:0;font-size:14px;color:#444;">Merci pour votre collaboration !<br/><strong>L'équipe Voyage Voyage</strong></p>
      </td></tr>
      <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e8f0f4;text-align:center;">
        <p style="margin:0;font-size:11px;color:#888;">📞 +253 77 07 33 77 &nbsp;|&nbsp; voyagevoyagedj.com</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

      await transporter.sendMail({
        from: `"Voyage Voyage" <${FROM_EMAIL}>`,
        to: partenaire.email,
        subject: `Clôture voyage — ${reversement.client_nom} · ${reversement.site_nom}`,
        html,
      });
      emailSent = true;
    }

    // WhatsApp number
    const number = (partenaire.telephone || "").replace(/\D/g, "");
    const waUrl = number
      ? `https://wa.me/${number}?text=${encodeURIComponent(whatsappText)}`
      : null;

    return NextResponse.json({ emailSent, waUrl });
  } catch (err) {
    console.error("send-partner-message error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
