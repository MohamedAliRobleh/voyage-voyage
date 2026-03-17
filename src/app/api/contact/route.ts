import { NextRequest, NextResponse } from "next/server";

const WEB3FORMS_KEY = "01035fd1-5e25-491c-bcaf-a6942b7ebe3c";

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

  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: `[Contact] ${subjectLabels[subject] || "Nouveau message"} — ${name}`,
      from_name: name,
      replyto: email,
      name,
      email,
      phone: phone || "—",
      sujet: subjectLabels[subject] || "—",
      message,
    }),
  });

  const data = await res.json();

  if (!data.success) {
    return NextResponse.json({ error: "Erreur envoi" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
