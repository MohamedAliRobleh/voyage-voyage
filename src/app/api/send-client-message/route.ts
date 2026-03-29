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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://voyagevoyagedj.com";
const FROM_EMAIL = process.env.OVH_SMTP_USER || "contact@voyagevoyagedj.com";
const ACCENT = "#408398";

function fmtDate(d: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}
function fmtMoney(n: number) {
  return `${Number(n).toLocaleString("fr-FR")} FDJ`;
}

function emailLayout(content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:560px;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0e2d38,#408398);padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td><img src="${BASE_URL}/images/pics/logo/logovoyage.webp" width="48" height="48" alt="Voyage Voyage" style="border-radius:50%;background:white;padding:3px;display:block;"/></td>
            <td style="padding-left:14px;"><p style="margin:0;font-size:18px;font-weight:900;color:white;letter-spacing:2px;text-transform:uppercase;">VOYAGE VOYAGE</p><p style="margin:3px 0 0;font-size:11px;color:rgba(255,255,255,0.65);">Agence de Tourisme — Djibouti</p></td>
          </tr>
        </table>
      </td></tr>
      <!-- Content -->
      <tr><td style="padding:32px;">${content}</td></tr>
      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e8f0f4;text-align:center;">
        <p style="margin:0;font-size:11px;color:#888;">📞 +253 77 07 33 77 &nbsp;|&nbsp; voyagevoyagedj.com</p>
        <p style="margin:6px 0 0;font-size:10px;color:#bbb;">Gabode 5, Zone Stid, Extension Lot 227 — Djibouti</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { type, doc, clientWhatsapp } = await req.json();

    if (!doc || !type) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const firstName = doc.client_nom?.split(" ")[0] || doc.client_nom;

    let subject = "";
    let htmlContent = "";
    let whatsappText = "";

    if (type === "payment_confirmation") {
      subject = `✅ Paiement confirmé — ${doc.numero}`;
      const voyageInfo = doc.date_depart
        ? `<p style="margin:12px 0 0;font-size:13px;color:#555;"><strong>Votre voyage :</strong> du ${fmtDate(doc.date_depart)}${doc.date_retour ? ` au ${fmtDate(doc.date_retour)}` : ""}</p>`
        : "";

      htmlContent = emailLayout(`
        <p style="margin:0 0 8px;font-size:22px;font-weight:900;color:#0e2d38;">Paiement reçu ✅</p>
        <p style="margin:0 0 24px;font-size:14px;color:#666;">Bonjour <strong>${firstName}</strong>,</p>
        <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.7;">
          Nous avons bien reçu votre paiement. Votre voyage est officiellement confirmé ! 🎉
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f9fb;border-radius:12px;border-left:4px solid ${ACCENT};padding:0;margin-bottom:24px;">
          <tr><td style="padding:18px 20px;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;color:${ACCENT};letter-spacing:1px;">Récapitulatif</p>
            <p style="margin:0;font-size:15px;font-weight:700;color:#0e2d38;">${doc.numero} — ${fmtMoney(doc.total)}</p>
            ${voyageInfo}
          </td></tr>
        </table>
        <p style="margin:0 0 24px;font-size:13px;color:#555;line-height:1.7;">
          Nous vous contacterons prochainement pour les détails finaux de votre séjour. En cas de question, n'hésitez pas à nous contacter via WhatsApp.
        </p>
        <p style="margin:0;font-size:14px;color:#444;">À très bientôt,<br/><strong>L'équipe Voyage Voyage</strong></p>
      `);

      whatsappText = `Bonjour ${firstName} 👋\n\nNous avons bien reçu votre paiement de *${fmtMoney(doc.total)}* pour la facture *${doc.numero}*. Votre voyage est confirmé ! 🎉${doc.date_depart ? `\n\n📅 Départ : ${fmtDate(doc.date_depart)}${doc.date_retour ? `\n📅 Retour : ${fmtDate(doc.date_retour)}` : ""}` : ""}\n\nMerci de votre confiance. Nous vous contacterons bientôt pour les derniers détails.\n\nL'équipe *Voyage Voyage* 🌍`;

    } else if (type === "return_message") {
      subject = `🌟 Merci pour votre confiance — Partagez votre expérience !`;
      const avisUrl = `${BASE_URL}/#avis`;

      htmlContent = emailLayout(`
        <p style="margin:0 0 8px;font-size:22px;font-weight:900;color:#0e2d38;">Comment s'est passé votre voyage ? 🌟</p>
        <p style="margin:0 0 24px;font-size:14px;color:#666;">Bonjour <strong>${firstName}</strong>,</p>
        <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.7;">
          Nous espérons que votre séjour s'est passé à merveille et que vous gardez de beaux souvenirs de votre aventure à Djibouti ! 🏖️
        </p>
        <p style="margin:0 0 24px;font-size:14px;color:#444;line-height:1.7;">
          Votre avis est précieux — non seulement pour nous aider à nous améliorer, mais aussi pour aider d'autres voyageurs à découvrir les merveilles de Djibouti.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td align="center">
            <a href="${avisUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0e2d38,${ACCENT});color:white;text-decoration:none;border-radius:12px;font-size:14px;font-weight:700;letter-spacing:0.5px;">
              ⭐ Laisser mon avis
            </a>
          </td></tr>
        </table>
        <p style="margin:0 0 24px;font-size:13px;color:#555;line-height:1.7;">
          Cela ne prend que 2 minutes et c'est un grand coup de pouce pour notre agence. Merci infiniment !
        </p>
        <p style="margin:0;font-size:14px;color:#444;">Avec toute notre gratitude,<br/><strong>L'équipe Voyage Voyage</strong></p>
      `);

      whatsappText = `Bonjour ${firstName} 👋\n\nNous espérons que votre voyage s'est passé à merveille ! 🌟\n\nVotre avis nous tient à cœur et aide d'autres voyageurs à découvrir Djibouti. Si vous avez quelques minutes, partagez votre expérience ici :\n👉 ${avisUrl}\n\nMerci infiniment pour votre confiance !\n\n*L'équipe Voyage Voyage* 🌍`;
    } else {
      return NextResponse.json({ error: "Type de message inconnu" }, { status: 400 });
    }

    // Envoi email
    let emailSent = false;
    if (doc.client_email) {
      await transporter.sendMail({
        from: `"Voyage Voyage" <${FROM_EMAIL}>`,
        to: doc.client_email,
        subject,
        html: htmlContent,
      });
      emailSent = true;
    }

    return NextResponse.json({
      ok: true,
      emailSent,
      whatsappText,
      whatsappNumber: clientWhatsapp || null,
    });

  } catch (err) {
    console.error("send-client-message error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
