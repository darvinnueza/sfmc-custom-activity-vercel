module.exports = async (req, res) => {
  try {
    let merged = req.body || {};

    if (Array.isArray(req.body?.inArguments)) {
      merged = req.body.inArguments.reduce((acc, item) => {
        if (item && typeof item === "object") Object.assign(acc, item);
        return acc;
      }, {});
    }

    // 2) Construir el objeto FINAL que SIEMPRE es Opción B
    const event = {
      request_id: merged.request_id || null,
      contact_key: merged.contact_key || null,
      phone_number: merged.phone_number || null,
      status: merged.status || "RECEIVED",
      contactListId: merged.contactListId || null,
      campaignId: merged.campaignId || null,
      useNewList: !!merged.useNewList,
      newListName: merged.newListName || null
    };

    // 3) Enviar a tu backend que guarda en Supabase (Opción B)
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

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("EXECUTE ERROR:", e);
    return res.status(500).json({ ok: false, error: "execute_failed", details: String(e?.message || e) });
  }
};