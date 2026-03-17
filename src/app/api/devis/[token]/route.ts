import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

function fmt(n: number) {
  return `${Number(n).toLocaleString("fr-FR")} DJF`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { data, error } = await supabase
    .from("factures")
    .select("*")
    .eq("token", token)
    .eq("type", "devis")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { action, message } = await req.json();

  const { data: devis, error } = await supabase
    .from("factures")
    .select("*")
    .eq("token", token)
    .eq("type", "devis")
    .single();

  if (error || !devis) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  if (devis.statut !== "envoyé") {
    return NextResponse.json({ error: "Ce devis ne peut plus être modifié" }, { status: 400 });
  }

  if (action === "accept") {
    await supabase
      .from("factures")
      .update({ statut: "accepté" })
      .eq("token", token);

    // Notify admin
    await resend.emails.send({
      from: "Voyage Voyage <contact@voyagevoyagedj.com>",
      to: "voyagevoyagedjib@gmail.com",
      subject: `✅ Devis ${devis.numero} accepté par ${devis.client_nom}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;">
          <h2 style="color:#0e2d38;">Devis accepté !</h2>
          <p style="color:#555;">Le client <strong>${devis.client_nom}</strong> a accepté le devis <strong>${devis.numero}</strong>.</p>
          <div style="background:#f5f9fb;border-radius:8px;padding:16px;margin:20px 0;">
            <p style="margin:0;font-size:13px;color:#333;"><strong>Montant :</strong> ${fmt(devis.total)}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#333;"><strong>Email client :</strong> ${devis.client_email || "—"}</p>
          </div>
          <p style="color:#555;font-size:13px;">Connectez-vous à votre espace admin pour confirmer et convertir en facture.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, action: "accepted" });
  }

  if (action === "message") {
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message vide" }, { status: 400 });
    }

    await supabase
      .from("factures")
      .update({ statut: "en_negociation", client_message: message })
      .eq("token", token);

    // Notify admin
    await resend.emails.send({
      from: "Voyage Voyage <contact@voyagevoyagedj.com>",
      to: "voyagevoyagedjib@gmail.com",
      replyTo: devis.client_email,
      subject: `💬 Question sur devis ${devis.numero} — ${devis.client_nom}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;">
          <h2 style="color:#0e2d38;">Question sur un devis</h2>
          <p style="color:#555;"><strong>${devis.client_nom}</strong> a une question concernant le devis <strong>${devis.numero}</strong> (${fmt(devis.total)}).</p>
          <div style="background:#fff8e1;border-left:3px solid #d97706;border-radius:4px;padding:16px;margin:20px 0;">
            <p style="margin:0;font-size:13px;color:#333;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="color:#555;font-size:13px;">Répondez directement à cet email pour contacter ${devis.client_nom} (${devis.client_email || "email non renseigné"}).</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, action: "message_sent" });
  }

  return NextResponse.json({ error: "Action invalide" }, { status: 400 });
}
