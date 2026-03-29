import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

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

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function buildEmailHtml(message: string) {
  const lines = message.split("\n").map(l => `<p style="margin:0 0 8px;font-size:14px;color:#444;line-height:1.7;">${l || "&nbsp;"}</p>`).join("");
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:560px;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:linear-gradient(135deg,#0e2d38,#408398);padding:24px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td><img src="${BASE_URL}/images/pics/logo/logovoyage.webp" width="44" height="44" alt="Voyage Voyage" style="border-radius:50%;background:white;padding:3px;display:block;"/></td>
            <td style="padding-left:12px;"><p style="margin:0;font-size:16px;font-weight:900;color:white;letter-spacing:2px;text-transform:uppercase;">VOYAGE VOYAGE</p><p style="margin:2px 0 0;font-size:10px;color:rgba(255,255,255,0.6);">Agence de Tourisme — Djibouti</p></td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="padding:28px 32px;">${lines}</td></tr>
      <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e8f0f4;text-align:center;">
        <p style="margin:0;font-size:11px;color:#888;">📞 +253 77 07 33 77 &nbsp;|&nbsp; voyagevoyagedj.com</p>
        <p style="margin:4px 0 0;font-size:9px;color:#ccc;">Pour ne plus recevoir ces communications, contactez-nous via WhatsApp.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, cible, canal, clientId } = await req.json();
    if (!message || !cible || !canal) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // Récupérer les clients selon la cible
    let query = supabaseAdmin.from("clients").select("id, nom, email, whatsapp, telephone, abonne_marketing");
    if (cible === "abonnes") query = query.eq("abonne_marketing", true);
    if (cible === "client") query = query.eq("id", clientId);

    const { data: clients, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!clients || clients.length === 0) {
      return NextResponse.json({ emailsSent: 0, waLinks: [] });
    }

    let emailsSent = 0;
    const waLinks: { nom: string; url: string }[] = [];
    const htmlBody = buildEmailHtml(message);

    for (const client of clients) {
      // Email
      if ((canal === "email" || canal === "les_deux") && client.email) {
        try {
          await transporter.sendMail({
            from: `"Voyage Voyage" <${FROM_EMAIL}>`,
            to: client.email,
            subject: "Voyage Voyage — Message de votre agence",
            html: htmlBody,
          });
          emailsSent++;
        } catch {
          // Continue même si un email échoue
        }
      }
      // WhatsApp
      if (canal === "whatsapp" || canal === "les_deux") {
        const number = (client.whatsapp || client.telephone || "").replace(/\D/g, "");
        if (number) {
          waLinks.push({
            nom: client.nom,
            url: `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
          });
        }
      }
    }

    return NextResponse.json({ emailsSent, waLinks });
  } catch (err) {
    console.error("send-broadcast error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
