"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  destination: string | null;
  created_at: string;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={onChange ? 28 : 18}
            className="transition-colors"
            fill={(hovered || value) >= star ? "#f59e0b" : "none"}
            stroke={(hovered || value) >= star ? "#f59e0b" : "#d1d5db"}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", rating: 0, comment: "", destination: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12);
    setReviews(data ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || form.rating === 0 || !form.comment.trim()) {
      setError("Veuillez remplir tous les champs obligatoires et donner une note.");
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.from("reviews").insert({
      name: form.name.trim(),
      rating: form.rating,
      comment: form.comment.trim(),
      destination: form.destination.trim() || null,
    });
    if (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } else {
      setSubmitted(true);
      setForm({ name: "", rating: 0, comment: "", destination: "" });
      fetchReviews();
    }
    setSubmitting(false);
  }

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl shadow-lg"
            style={{ background: "linear-gradient(135deg, #408398, #5bb8d4)" }}
          >
            ⭐
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 mb-3">
            Avis Voyageurs
          </h2>
          {avg && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-3xl font-black text-amber-500">{avg}</span>
              <StarRating value={Math.round(Number(avg))} />
              <span className="text-gray-400 text-sm">({reviews.length} avis)</span>
            </div>
          )}
          <p className="text-gray-400 uppercase tracking-[0.3em] text-xs mt-2">
            Ce que disent nos voyageurs
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-gray-50 rounded-3xl p-8">
              <h3 className="text-xl font-black uppercase tracking-wide text-gray-900 mb-6">
                Partagez votre expérience
              </h3>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="thanks"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="text-5xl mb-4">🙏</div>
                    <p className="text-lg font-bold text-gray-900 mb-2">Merci pour votre avis !</p>
                    <p className="text-gray-500 text-sm mb-6">Votre témoignage aide d'autres voyageurs.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-sm font-semibold underline text-[#408398]"
                    >
                      Laisser un autre avis
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                        Votre note *
                      </label>
                      <StarRating
                        value={form.rating}
                        onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Votre prénom ou nom"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#408398] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                        Destination visitée
                      </label>
                      <input
                        type="text"
                        value={form.destination}
                        onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                        placeholder="Ex : Lac Assal, Îles Moucha..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#408398] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                        Votre avis *
                      </label>
                      <textarea
                        value={form.comment}
                        onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                        placeholder="Décrivez votre expérience..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#408398] text-sm resize-none"
                      />
                    </div>

                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-full font-black uppercase tracking-widest text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #408398, #5bb8d4)" }}
                    >
                      {submitting ? "Envoi..." : "Publier mon avis"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Reviews list */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            {/* Cadre scrollable */}
            <div className="border border-gray-200 rounded-3xl bg-gray-50 shadow-inner overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-40 text-gray-400">Chargement...</div>
              ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-center p-8">
                  <span className="text-4xl mb-3">💬</span>
                  <p className="text-sm">Soyez le premier à laisser un avis !</p>
                </div>
              ) : (
                <>
                  {/* Header du cadre */}
                  <div className="px-5 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      {reviews.length} avis
                    </span>
                    <span className="text-xs text-gray-400">↕ Défiler pour voir plus</span>
                  </div>

                  {/* Zone scrollable */}
                  <div className="overflow-y-auto max-h-[520px] divide-y divide-gray-200">
                    {reviews.map((r) => (
                      <div key={r.id} className="bg-white hover:bg-gray-50 transition-colors p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {/* Avatar initiale */}
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                              style={{ background: "linear-gradient(135deg, #408398, #5bb8d4)" }}
                            >
                              {r.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                              {r.destination && (
                                <p className="text-xs text-[#408398] font-medium">📍 {r.destination}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <StarRating value={r.rating} />
                            <p className="text-gray-300 text-xs">
                              {new Date(r.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed pl-13 ml-[52px]">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
