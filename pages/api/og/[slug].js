import { ImageResponse } from "@vercel/og";
import { getServiceClient } from "../../../lib/supabaseClient";

export const config = { runtime: "edge" };

export default async function handler(req) {
  const slug = req.url.split("/").pop();

  const supabase = getServiceClient();
  const { data: note } = await supabase
    .from("notes")
    .select("title, content_json, date")
    .eq("slug", slug)
    .single();

  const title = note?.title || "GS Daily Digest";
  const points = note?.content_json?.quickRecall?.slice(0, 4) || [
    "Set GEMINI_API_KEY, SUPABASE keys, and run the daily job to see real content here.",
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1080px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FBFAF5",
          padding: "70px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#9A3324", letterSpacing: 4, fontWeight: 600 }}>
          DAILY GS BRIEF
        </div>
        <div style={{ fontSize: 52, color: "#16223F", fontWeight: 700, marginTop: 20, lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ height: 4, width: 160, backgroundColor: "#B8722C", marginTop: 30, marginBottom: 40 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {points.map((p, i) => (
            <div key={i} style={{ display: "flex", fontSize: 34, color: "#3D4A6B" }}>
              <span style={{ color: "#B8722C", marginRight: 16 }}>—</span>
              <span>{p}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "auto", fontSize: 26, color: "#5F6B4E" }}>
          Full digest + quiz on the website
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
