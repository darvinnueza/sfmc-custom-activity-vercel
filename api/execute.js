// sfmc-custom-activity-vercel/api/execute.js
module.exports = async (req, res) => {
  // CORS (por si acaso)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
    console.log("PATH:", req.url);
    console.log("BODY_IN:", JSON.stringify(req.body ?? {}, null, 2));

    // 1) Normalizar entrada (si SFMC manda inArguments, lo aplanamos)
    let merged = req.body || {};
    if (Array.isArray(req.body?.inArguments)) {
      merged = req.body.inArguments.reduce((acc, item) => {
        if (item && typeof item === "object") Object.assign(acc, item);
        return acc;
      }, {});
    }

    // 2) Opción B FINAL (PLANO) — SOLO CAMPOS QUE TU TABLA REQUIERE
    // Tabla vb_events requiere NOT NULL: request_id, contact_key, phone_number, contact_list_id, campaign_id, status
    const event = {
      request_id: merged.request_id ?? null,
      contact_key: merged.contact_key ?? null,
      phone_number: merged.phone_number ?? null,
      status: merged.status ?? "RECEIVED",
      contactListId: merged.contactListId ?? null,
      campaignId: merged.campaignId ?? null
    };

    console.log("EVENT_OUT (PLANO):", JSON.stringify(event, null, 2));

    // 3) Validación mínima ANTES de llamar al collector
    const missing = [];
    if (!event.request_id) missing.push("request_id");
    if (!event.contact_key) missing.push("contact_key");
    if (!event.phone_number) missing.push("phone_number");
    if (!event.contactListId) missing.push("contactListId");
    if (!event.campaignId) missing.push("campaignId");

    if (missing.length) {
      console.error("MISSING_FIELDS:", missing.join(", "));
      return res.status(400).json({ ok: false, error: "missing_fields", fields: missing });
    }

    // 4) Reenviar al collector (custom-activity-service-demo)
    const base = process.env.EVENTS_API_BASE; // ej: https://custom-activity-service-demo.vercel.app
    if (!base) throw new Error("Missing env EVENTS_API_BASE");

    const r = await fetch(`${base}/api/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event) // ✅ PLANO SIEMPRE
    });

    const txt = await r.text().catch(() => "");

    if (!r.ok) {
      console.error("EVENTS_API error:", r.status, txt);
      return res.status(500).json({ ok: false, error: "events_api_failed", details: txt });
    }

    // Si el collector devuelve JSON, lo intentamos parsear (si no, devolvemos ok:true)
    let data = null;
    try { data = JSON.parse(txt); } catch (_) {}

    return res.status(200).json({ ok: true, collector: data ?? txt });
  } catch (e) {
    console.error("EXECUTE ERROR:", e);
    return res.status(500).json({ ok: false, error: "execute_failed", details: String(e?.message || e) });
  }
};