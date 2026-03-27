import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import type { Facture } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://voyagevoyagedj.com";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function formatMoney(n: number) {
  return `${Number(n).toLocaleString("fr-FR")} DJF`;
}

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function generateHTML(doc: Facture): string {
  const isDevis = doc.type === "devis";
  const accentColor = isDevis ? "#d97706" : "#408398";
  const total_ht = doc.total;
  const clientLink = isDevis && doc.token ? `${BASE_URL}/devis/${doc.token}` : null;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${doc.numero}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:680px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0e2d38,#265868);padding:32px 40px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:22px;font-weight:900;color:white;letter-spacing:2px;text-transform:uppercase;">VOYAGE VOYAGE</div>
        <div style="text-align:right;">
          <div style="font-size:26px;font-weight:900;color:${accentColor};text-transform:uppercase;letter-spacing:3px;">${isDevis ? "DEVIS" : "FACTURE"}</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:2px;">${doc.numero}</div>
        </div>
      </div>
    </div>

    <div style="padding:40px;">

      <!-- Meta -->
      <table style="width:100%;margin-bottom:32px;">
        <tr>
          <td style="vertical-align:top;width:50%;">
            <p style="font-size:10px;font-weight:700;text-transform:uppercase;color:${accentColor};letter-spacing:1px;margin:0 0 6px;">${isDevis ? "Destinataire" : "Facturé à"}</p>
            <p style="font-size:15px;font-weight:700;color:#1a1a1a;margin:0 0 2px;">${doc.client_nom}</p>
            ${doc.client_email ? `<p style="font-size:12px;color:#555;margin:0;">${doc.client_email}</p>` : ""}
          </td>
          <td style="vertical-align:top;text-align:right;">
            <p style="font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:1px;margin:0 0 2px;">Date d'émission</p>
            <p style="font-size:13px;font-weight:600;color:#1a1a1a;margin:0 0 12px;">${formatDate(doc.date)}</p>
            ${doc.echeance ? `
            <p style="font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:1px;margin:0 0 2px;">${isDevis ? "Validité jusqu'au" : "Échéance"}</p>
            <p style="font-size:13px;font-weight:600;color:${accentColor};margin:0;">${formatDate(doc.echeance)}</p>` : ""}
          </td>
        </tr>
      </table>

      <!-- Divider -->
      <div style="border-top:2px solid ${accentColor};margin-bottom:24px;"></div>

      <!-- Table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#0e2d38;">
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:white;">Description</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;color:white;">Qté</th>
            <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;color:white;">Prix unit.</th>
            <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;color:white;">Montant</th>
          </tr>
        </thead>
        <tbody>
          ${doc.lignes.map((l, i) => `
          <tr style="background:${i % 2 === 0 ? "white" : "#f5f9fb"};">
            <td style="padding:10px 14px;font-size:12px;color:#333;border-bottom:1px solid #e8f0f3;">${l.description}</td>
            <td style="padding:10px 14px;font-size:12px;color:#555;text-align:center;border-bottom:1px solid #e8f0f3;">${l.quantite}</td>
            <td style="padding:10px 14px;font-size:12px;color:#555;text-align:right;border-bottom:1px solid #e8f0f3;">${formatMoney(l.prix_unitaire)}</td>
            <td style="padding:10px 14px;font-size:12px;font-weight:600;color:#1a1a1a;text-align:right;border-bottom:1px solid #e8f0f3;">${formatMoney(l.quantite * l.prix_unitaire)}</td>
          </tr>`).join("")}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="display:flex;justify-content:flex-end;margin-bottom:32px;">
        <div style="width:260px;">
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;border-bottom:1px solid #eee;">
            <span style="color:#555;">Sous-total HT</span>
            <span style="font-weight:600;">${formatMoney(total_ht)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;border-bottom:1px solid #eee;">
            <span style="color:#555;">TVA (exonéré)</span>
            <span style="font-weight:600;">0 DJF</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:12px 14px;font-size:15px;font-weight:800;background:#0e2d38;color:white;border-radius:8px;margin-top:8px;">
            <span>TOTAL TTC</span>
            <span>${formatMoney(total_ht)}</span>
          </div>
        </div>
      </div>

      ${doc.notes ? `
      <div style="margin-bottom:24px;padding:14px 16px;background:#f5f9fb;border-radius:8px;border-left:3px solid ${accentColor};">
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;color:${accentColor};letter-spacing:1px;margin:0 0 6px;">Notes</p>
        <p style="font-size:12px;color:#555;line-height:1.6;margin:0;">${doc.notes}</p>
      </div>` : ""}

      <!-- Conditions -->
      <div style="margin-bottom:${isDevis && clientLink ? "24px" : "32px"};padding:14px 16px;background:#fafafa;border-radius:8px;">
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:1px;margin:0 0 6px;">Conditions</p>
        <p style="font-size:11px;color:#555;line-height:1.8;margin:0;">
          ${isDevis
            ? `Ce devis est valable ${doc.echeance ? `jusqu'au ${formatDate(doc.echeance)}` : "30 jours à compter de sa date d'émission"}. Tout devis accepté constitue un engagement contractuel. Un acompte de 30% sera demandé à la confirmation.`
            : "Paiement à réception de facture. Tout retard de paiement entraîne des pénalités conformément aux conditions générales de vente."
          }
        </p>
      </div>

      ${isDevis && clientLink ? `
      <!-- CTA Block -->
      <div style="text-align:center;margin-bottom:32px;padding:28px 24px;background:linear-gradient(135deg,#f5f9fb,#e8f4f7);border-radius:14px;border:1px solid #d0e8f0;">
        <p style="font-size:15px;font-weight:700;color:#0e2d38;margin:0 0 8px;">Votre réponse en un clic</p>
        <p style="font-size:13px;color:#555;margin:0 0 20px;">Acceptez ce devis directement en ligne, ou posez-nous vos questions.</p>
        <a href="${clientLink}"
           style="display:inline-block;padding:14px 32px;background:#16a34a;color:white;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.5px;">
          Voir et répondre à ce devis →
        </a>
        <p style="font-size:11px;color:#888;margin:16px 0 0;">Ou copiez ce lien dans votre navigateur :<br/><span style="color:#408398;">${clientLink}</span></p>
      </div>` : ""}

    </div>

    <!-- Footer -->
    <div style="background:#f5f9fb;padding:20px 40px;text-align:center;border-top:1px solid #e8f0f3;">
      <p style="font-size:11px;color:#888;line-height:1.8;margin:0;">
        VOYAGE VOYAGE — Agence de Tourisme — Djibouti-Ville, République de Djibouti<br/>
        Tél : +253 77 07 33 77 | voyagevoyagedjib@gmail.com | voyagevoyagedj.com
      </p>
    </div>

  </div>
</body>
</html>`;
}

function generateText(doc: Facture): string {
  const isDevis = doc.type === "devis";
  const clientLink = isDevis && doc.token ? `${BASE_URL}/devis/${doc.token}` : null;
  const lines = doc.lignes.map(l =>
    `- ${l.description} x${l.quantite} @ ${formatMoney(l.prix_unitaire)} = ${formatMoney(l.quantite * l.prix_unitaire)}`
  ).join("\n");

  return `Bonjour ${doc.client_nom},

Veuillez trouver ci-dessous votre ${isDevis ? "devis" : "facture"} ${doc.numero}.

Date : ${formatDate(doc.date)}${doc.echeance ? `\n${isDevis ? "Validité" : "Échéance"} : ${formatDate(doc.echeance)}` : ""}

DÉTAIL
------
${lines}

TOTAL : ${formatMoney(doc.total)}

${doc.notes ? `Notes : ${doc.notes}\n\n` : ""}${clientLink ? `Pour accepter ce devis ou poser une question :\n${clientLink}` : "Paiement à réception de facture."}

Cordialement,
Voyage Voyage
voyagevoyagedjib@gmail.com | +253 77 07 33 77`;
}

export async function POST(req: NextRequest) {
  const { document } = await req.json() as { document: Facture };

  if (!document.client_email) {
    return NextResponse.json({ error: "Email du client manquant" }, { status: 400 });
  }

  const isDevis = document.type === "devis";
  const subject = isDevis
    ? `Devis ${document.numero} — Voyage Voyage`
    : `Facture ${document.numero} — Voyage Voyage`;

  const { error } = await resend.emails.send({
    from: "Voyage Voyage <contact@voyagevoyagedj.com>",
    to: document.client_email,
    reply_to: "voyagevoyagedjib@gmail.com",
    subject,
    html: generateHTML(document),
    text: generateText(document),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Auto-update status to "envoyé" when email is sent
  if (document.id) {
    await supabaseAdmin
      .from("factures")
      .update({ statut: "envoyé" })
      .eq("id", document.id);
  }

  return NextResponse.json({ success: true });
}
