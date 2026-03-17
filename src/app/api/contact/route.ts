import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
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

  const { error } = await resend.emails.send({
    from: "Voyage Voyage <onboarding@resend.dev>",
    to: ["voyagevoyagedjib@gmail.com"],
    replyTo: email,
    subject: `[Contact] ${subjectLabels[subject] || "Nouveau message"} — ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0e2d38, #265868); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Nouveau message — Voyage Voyage</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 120px;">Nom</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 600;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Email</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #408398;">${email}</a></td>
            </tr>
            ${phone ? `<tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Téléphone</td>
              <td style="padding: 8px 0; color: #111827;">${phone}</td>
            </tr>` : ""}
            ${subject ? `<tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Sujet</td>
              <td style="padding: 8px 0; color: #111827;">${subjectLabels[subject] || subject}</td>
            </tr>` : ""}
          </table>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">Message :</p>
          <p style="color: #111827; line-height: 1.6; white-space: pre-wrap; background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">${message}</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Répondre directement à cet email pour contacter ${name}.</p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Erreur envoi email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
