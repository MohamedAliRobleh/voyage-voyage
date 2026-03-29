import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { name, email, phone, subject, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const subjectLabels: Record<string, string> = {
    reservation: "Réservation",
    info: "Demande d'information",
    groupe: "Voyage en groupe",
    autre: "Autre",
  };

  const subjectLabel = subjectLabels[subject] || "Nouveau message";

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#0e2d38,#265868);padding:24px 32px;">
      <p style="font-size:18px;font-weight:900;color:white;letter-spacing:2px;text-transform:uppercase;margin:0;">VOYAGE VOYAGE</p>
      <p style="font-size:12px;color:rgba(255,255,255,0.6);margin:4px 0 0;">Nouveau message depuis le site web</p>
    </div>
    <div style="padding:28px 32px;border-bottom:1px solid #f0f4f8;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;width:110px;">Nom</td>
          <td style="padding:6px 0;font-size:13px;color:#1a1a1a;font-weight:600;">${name}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;">Email</td>
          <td style="padding:6px 0;font-size:13px;color:#408398;"><a href="mailto:${email}" style="color:#408398;">${email}</a></td>
        </tr>
        ${phone ? `<tr>
          <td style="padding:6px 0;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;">Téléphone</td>
          <td style="padding:6px 0;font-size:13px;color:#1a1a1a;">${phone}</td>
        </tr>` : ""}
        <tr>
          <td style="padding:6px 0;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;">Sujet</td>
          <td style="padding:6px 0;font-size:13px;color:#1a1a1a;">${subjectLabel}</td>
        </tr>
      </table>
    </div>
    <div style="padding:28px 32px;">
      <p style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Message</p>
      <p style="font-size:13px;color:#333;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
    </div>
    <div style="padding:16px 32px;background:#f5f9fb;text-align:center;">
      <p style="font-size:11px;color:#aaa;margin:0;">Répondez directement à cet email pour contacter ${name}</p>
    </div>
  </div>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: "Voyage Voyage <contact@voyagevoyagedj.com>",
    to: "voyagevoyagedjib@gmail.com",
    replyTo: email,
    subject: `[Contact] ${subjectLabel} — ${name}`,
    html,
    text: `Nouveau message de ${name} (${email})\nTéléphone: ${phone || "—"}\nSujet: ${subjectLabel}\n\n${message}`,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Erreur envoi" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
