import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  const PLACE_ID = process.env.GOOGLE_PLACES_PLACE_ID;
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

  if (!PLACE_ID || !API_KEY) {
    return NextResponse.json(
      { error: "Variables manquantes : GOOGLE_PLACES_PLACE_ID et GOOGLE_PLACES_API_KEY requis dans .env.local" },
      { status: 500 }
    );
  }

  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${PLACE_ID}` +
    `&fields=reviews,rating,user_ratings_total` +
    `&language=fr` +
    `&reviews_sort=newest` +
    `&key=${API_KEY}`;

  let data: Record<string, unknown>;
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    data = await res.json();
  } catch {
    return NextResponse.json({ error: "Erreur réseau Google Places" }, { status: 500 });
  }

  if (data.status !== "OK") {
    return NextResponse.json(
      { error: `Google API: ${data.status} — ${(data.error_message as string) || ""}` },
      { status: 500 }
    );
  }

  const result = data.result as Record<string, unknown>;
  const googleReviews = (result?.reviews as unknown[]) || [];
  let synced = 0;
  let errors = 0;

  for (const rev of googleReviews) {
    const r = rev as Record<string, unknown>;
    const google_review_id = `google_${r.time}_${String(r.author_name).replace(/\s+/g, "_")}`;

    const { error } = await supabase.from("reviews").upsert(
      {
        google_review_id,
        name: r.author_name as string,
        rating: r.rating as number,
        comment: (r.text as string) || "(sans commentaire)",
        destination: null,
        source: "google",
        avatar_url: (r.profile_photo_url as string) || null,
        created_at: new Date((r.time as number) * 1000).toISOString(),
      },
      { onConflict: "google_review_id" }
    );

    if (error) errors++;
    else synced++;
  }

  return NextResponse.json({
    synced,
    errors,
    total: googleReviews.length,
    google_rating: result?.rating,
    google_total: result?.user_ratings_total,
  });
}
