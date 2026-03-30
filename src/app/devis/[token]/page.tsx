"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import type { Facture } from "@/lib/supabase";
import { Check, MessageCircle, Loader2, AlertCircle, ChevronDown, ChevronUp, Eraser } from "lucide-react";

type State = "loading" | "ready" | "accepted" | "messaged" | "already_done" | "error" | "not_found";

export default function DevisClientPage() {
  const { token } = useParams<{ token: string }>();
  const [devis, setDevis] = useState<Facture | null>(null);
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    fetch(`/api/devis/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setState("not_found"); return; }
        setDevis(data);
        if (data.statut === "accepté") setState("already_done");
        else if (data.statut === "en_negociation") setState("already_done");
        else if (data.statut === "envoyé") setState("ready");
        else setState("not_found");
      })
      .catch(() => setState("error"));
  }, [token]);

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e instanceof TouchEvent) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    setIsSigning(true);
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isSigning) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !lastPos.current) return;
    e.preventDefault();
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#0e2d38";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    setHasSigned(true);
  }, [isSigning]);

  const stopDraw = useCallback(() => {
    setIsSigning(false);
    lastPos.current = null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseleave", stopDraw);
    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDraw);
    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDraw);
      canvas.removeEventListener("mouseleave", stopDraw);
      canvas.removeEventListener("touchstart", startDraw);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDraw);
    };
  }, [startDraw, draw, stopDraw]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleAccept = async () => {
    if (!hasSigned) return;
    setSubmitting(true);
    const canvas = canvasRef.current;
    const signature = canvas ? canvas.toDataURL("image/png") : null;
    const res = await fetch(`/api/devis/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept", signature }),
    });
    if (res.ok) setState("accepted");
    else setState("error");
    setSubmitting(false);
  };

  const handleMessage = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/devis/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "message", message }),
    });
    if (res.ok) setState("messaged");
    else setState("error");
    setSubmitting(false);
  };

  const fmt = (n: number) => `${Number(n).toLocaleString("fr-FR")} DJF`;
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

  type NoteSection = { title: string | null; content: string; color: string; bg: string; border: string; list: boolean };
  function parseNotes(notes: string): NoteSection[] {
    const markers = [
      { regex: /✅\s*INCLUS(?!\s*NON)/i, title: "✅ Inclus", color: "#16a34a", bg: "#f0fdf4", border: "#16a34a", list: true },
      { regex: /(?:❌|🚫|✗)\s*NON\s*INCLUS/i, title: "❌ Non inclus", color: "#dc2626", bg: "#fef2f2", border: "#dc2626", list: true },
      { regex: /CONDITIONS?\s+(?:DES?\s+)?R[EÉ]SERVATION/i, title: "📋 Conditions de réservation", color: "#d97706", bg: "#fffbeb", border: "#d97706", list: false },
      { regex: /(?:📍\s*)?INFORMATIONS?\s+LOGISTIQUES?/i, title: "📍 Informations logistiques", color: "#408398", bg: "#eff8fb", border: "#408398", list: true },
    ];
    const positions: { start: number; end: number; def: typeof markers[0] }[] = [];
    for (const def of markers) {
      const m = def.regex.exec(notes);
      if (m) positions.push({ start: m.index, end: m.index + m[0].length, def });
    }
    positions.sort((a, b) => a.start - b.start);
    if (positions.length === 0) return [{ title: null, content: notes, color: "#555", bg: "#f5f9fb", border: "#d97706", list: false }];
    const sections: NoteSection[] = [];
    const before = notes.slice(0, positions[0].start).trim();
    if (before) sections.push({ title: null, content: before, color: "#555", bg: "#f5f9fb", border: "#d97706", list: false });
    for (let i = 0; i < positions.length; i++) {
      const { end, def } = positions[i];
      const nextStart = positions[i + 1]?.start ?? notes.length;
      const content = notes.slice(end, nextStart).replace(/^[\s•]+/, "").trim();
      sections.push({ title: def.title, content, color: def.color, bg: def.bg, border: def.border, list: def.list });
    }
    return sections;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "Arial, Helvetica, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0e2d38,#265868)", padding: "20px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/pics/logo/logovoyage.webp" alt="Voyage Voyage" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "contain" }} />
          <span style={{ color: "white", fontWeight: 900, fontSize: 16, letterSpacing: 2, textTransform: "uppercase" }}>Voyage Voyage</span>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "32px auto", padding: "0 16px 48px" }}>

        {/* Loading */}
        {state === "loading" && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <Loader2 size={32} style={{ color: "#408398", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ color: "#555" }}>Chargement du devis...</p>
          </div>
        )}

        {/* Not found / error */}
        {(state === "not_found" || state === "error") && (
          <div style={{ background: "white", borderRadius: 16, padding: "40px 32px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <AlertCircle size={40} style={{ color: "#e53e3e", margin: "0 auto 16px" }} />
            <h2 style={{ color: "#1a1a1a", marginBottom: 8 }}>Devis introuvable</h2>
            <p style={{ color: "#555", fontSize: 14 }}>Ce lien est invalide ou a expiré. Contactez-nous directement.</p>
            <a href="mailto:voyagevoyagedjib@gmail.com" style={{ display: "inline-block", marginTop: 20, color: "#408398", fontSize: 14 }}>voyagevoyagedjib@gmail.com</a>
          </div>
        )}

        {/* Already done */}
        {state === "already_done" && devis && (
          <div style={{ background: "white", borderRadius: 16, padding: "40px 32px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Check size={28} style={{ color: "#16a34a" }} />
            </div>
            <h2 style={{ color: "#1a1a1a", marginBottom: 8 }}>
              {devis.statut === "accepté" ? "Devis accepté" : "Message envoyé"}
            </h2>
            <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6 }}>
              {devis.statut === "accepté"
                ? "Vous avez déjà accepté ce devis. Notre équipe vous contactera très prochainement pour finaliser votre voyage."
                : "Votre question a été transmise. Notre équipe vous répondra dans les plus brefs délais."
              }
            </p>
            <p style={{ marginTop: 24, fontSize: 13, color: "#888" }}>Référence : <strong>{devis.numero}</strong></p>
          </div>
        )}

        {/* Ready to respond */}
        {state === "ready" && devis && (
          <>
            {/* Devis card */}
            <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", marginBottom: 20 }}>
              {/* Doc header */}
              <div style={{ background: "#fff8e1", borderBottom: "2px solid #d97706", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#d97706", marginBottom: 4 }}>Devis</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#1a1a1a" }}>{devis.numero}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Pour</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{devis.client_nom}</div>
                </div>
              </div>

              <div style={{ padding: "24px 28px" }}>
                {/* Dates */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #f0f4f8" }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: 1, marginBottom: 4 }}>Date d&apos;émission</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{fmtDate(devis.date)}</div>
                  </div>
                  {devis.echeance && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: 1, marginBottom: 4 }}>Valide jusqu&apos;au</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#d97706" }}>{fmtDate(devis.echeance)}</div>
                    </div>
                  )}
                </div>

                {/* Lignes */}
                <div style={{ overflowX: "auto", marginBottom: 20 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 340 }}>
                  <thead>
                    <tr style={{ background: "#0e2d38" }}>
                      <th style={{ padding: "9px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "white", textTransform: "uppercase" }}>Prestation</th>
                      <th style={{ padding: "9px 12px", textAlign: "center", fontSize: 11, fontWeight: 700, color: "white", textTransform: "uppercase" }}>Qté</th>
                      <th style={{ padding: "9px 12px", textAlign: "right", fontSize: 11, fontWeight: 700, color: "white", textTransform: "uppercase" }}>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devis.lignes.map((l, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f5f9fb" }}>
                        <td style={{ padding: "10px 12px", fontSize: 13, color: "#333", borderBottom: "1px solid #eef2f5" }}>{l.description}</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, color: "#555", textAlign: "center", borderBottom: "1px solid #eef2f5" }}>{l.quantite}</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#1a1a1a", textAlign: "right", borderBottom: "1px solid #eef2f5" }}>{fmt(l.quantite * l.prix_unitaire)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>

                {/* Total */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: devis.notes ? 20 : 0 }}>
                  <div style={{ minWidth: "min(220px, 100%)", width: "100%", maxWidth: 320 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#0e2d38", borderRadius: 8, fontSize: 15, fontWeight: 800, color: "white" }}>
                      <span>TOTAL TTC</span>
                      <span>{fmt(devis.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {devis.notes && (
                  <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                    {parseNotes(devis.notes).map((section, i) => (
                      <div key={i} style={{ padding: "12px 14px", background: section.bg, borderRadius: 8, borderLeft: `3px solid ${section.border}` }}>
                        {section.title && (
                          <div style={{ fontSize: 11, fontWeight: 700, color: section.color, marginBottom: 7 }}>{section.title}</div>
                        )}
                        {section.list ? (
                          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                            {section.content.split(/\s*•\s*/).filter(Boolean).map((item, j) => (
                              <li key={j} style={{ fontSize: 12, color: "#444", lineHeight: 1.6, display: "flex", gap: 6, alignItems: "flex-start" }}>
                                <span style={{ color: section.color, flexShrink: 0, fontWeight: 700 }}>•</span>
                                <span>{item.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p style={{ fontSize: 12, color: "#444", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{section.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CTA section */}
            <div style={{ background: "white", borderRadius: 16, padding: "28px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 6, marginTop: 0 }}>Votre réponse</h3>
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 24 }}>
                Lisez attentivement les prestations ci-dessus. Si ce devis vous convient, acceptez-le directement. Sinon, posez-nous vos questions.
              </p>

              {/* Signature pad */}
              {state === "ready" && !showMessageBox && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0e2d38" }}>
                      ✍️ Votre signature <span style={{ color: "#e53e3e", fontSize: 12 }}>*</span>
                    </span>
                    <button
                      onClick={clearSignature}
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "none", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "#666" }}
                    >
                      <Eraser size={12} /> Effacer
                    </button>
                  </div>
                  <div style={{ border: `2px solid ${hasSigned ? "#16a34a" : "#d1d5db"}`, borderRadius: 10, overflow: "hidden", background: "#fafafa", position: "relative", transition: "border-color 0.2s" }}>
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={160}
                      style={{ width: "100%", height: 160, display: "block", cursor: "crosshair", touchAction: "none" }}
                    />
                    {!hasSigned && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                        <span style={{ fontSize: 13, color: "#bbb", userSelect: "none" }}>Signez ici avec votre doigt ou votre souris</span>
                      </div>
                    )}
                  </div>
                  {!hasSigned && (
                    <p style={{ fontSize: 11, color: "#e53e3e", marginTop: 6 }}>La signature est requise pour accepter le devis.</p>
                  )}
                </div>
              )}

              {/* Accept button */}
              {state === "ready" && !showMessageBox && (
                <button
                  onClick={handleAccept}
                  disabled={submitting || !hasSigned}
                  style={{
                    width: "100%", padding: "16px", background: hasSigned ? "#16a34a" : "#9ca3af", color: "white",
                    border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
                    cursor: submitting || !hasSigned ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    marginBottom: 12, transition: "all 0.2s"
                  }}
                >
                  {submitting ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={18} />}
                  {submitting ? "Envoi en cours..." : "J'accepte ce devis"}
                </button>
              )}

              {/* Message toggle */}
              {!showMessageBox ? (
                <button
                  onClick={() => setShowMessageBox(true)}
                  style={{
                    width: "100%", padding: "14px", background: "white", color: "#408398",
                    border: "2px solid #408398", borderRadius: 12, fontSize: 14, fontWeight: 600,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                  }}
                >
                  <MessageCircle size={16} />
                  Demander plus d&apos;informations
                  <ChevronDown size={14} />
                </button>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#408398" }}>Votre question / commentaire</span>
                    <button onClick={() => setShowMessageBox(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                      <ChevronUp size={14} /> Réduire
                    </button>
                  </div>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Ex: Puis-je avoir plus de détails sur le transport inclus ? Est-il possible de modifier les dates ?"
                    style={{
                      width: "100%", padding: "12px 14px", border: "1px solid #d1d5db",
                      borderRadius: 10, fontSize: 13, color: "#333", resize: "vertical",
                      fontFamily: "Arial, sans-serif", boxSizing: "border-box", marginBottom: 10,
                      outline: "none"
                    }}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => setShowMessageBox(false)}
                      style={{ flex: 1, padding: "12px", background: "white", border: "1px solid #d1d5db", borderRadius: 10, fontSize: 13, color: "#555", cursor: "pointer" }}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleMessage}
                      disabled={submitting || !message.trim()}
                      style={{
                        flex: 2, padding: "12px", background: "#408398", color: "white",
                        border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600,
                        cursor: submitting || !message.trim() ? "not-allowed" : "pointer",
                        opacity: submitting || !message.trim() ? 0.6 : 1,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                      }}
                    >
                      {submitting ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <MessageCircle size={15} />}
                      Envoyer ma question
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Accepted */}
        {state === "accepted" && (
          <div style={{ background: "white", borderRadius: 16, padding: "48px 32px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Check size={32} style={{ color: "#16a34a" }} />
            </div>
            <h2 style={{ color: "#16a34a", fontSize: 22, marginBottom: 12 }}>Devis accepté !</h2>
            <p style={{ color: "#555", fontSize: 14, lineHeight: 1.8, maxWidth: 420, margin: "0 auto 24px" }}>
              Merci pour votre confiance. Notre équipe a été notifiée et vous contactera dans les plus brefs délais pour finaliser les détails de votre voyage.
            </p>
            <div style={{ background: "#f5f9fb", borderRadius: 10, padding: "12px 20px", display: "inline-block" }}>
              <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
                Des questions ? Écrivez-nous à{" "}
                <a href="mailto:voyagevoyagedjib@gmail.com" style={{ color: "#408398" }}>voyagevoyagedjib@gmail.com</a>
              </p>
            </div>
          </div>
        )}

        {/* Message sent */}
        {state === "messaged" && (
          <div style={{ background: "white", borderRadius: 16, padding: "48px 32px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <MessageCircle size={32} style={{ color: "#408398" }} />
            </div>
            <h2 style={{ color: "#0e2d38", fontSize: 22, marginBottom: 12 }}>Message envoyé !</h2>
            <p style={{ color: "#555", fontSize: 14, lineHeight: 1.8, maxWidth: 420, margin: "0 auto" }}>
              Votre question a bien été transmise à notre équipe. Nous vous répondrons directement par email dans les meilleurs délais.
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <p style={{ fontSize: 11, color: "#aaa" }}>
            VOYAGE VOYAGE — Agence de Tourisme — Djibouti-Ville<br />
            +253 77 07 33 77 | voyagevoyagedjib@gmail.com
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
