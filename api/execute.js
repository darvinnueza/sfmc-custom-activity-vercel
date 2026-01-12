module.exports = async (req, res) => {
  try {
    // SFMC manda inArguments como array (tu caso real)
    const inArgs = req.body?.inArguments || [];
    const merged = inArgs.reduce((acc, item) => {
      if (item && typeof item === "object") Object.assign(acc, item);
      return acc;
    }, {});

    // ✅ payload plano para tu service-demo (Supabase)
    const event = {
      request_id: merged.request_id || null,
      contact_key: merged.contact_key || null,
      phone_number: merged.phone_number || null,
      status: merged.status || "RECEIVED",
      contactListId: merged.contactListId || null,
      campaignId: merged.campaignId || null
    };

    const base = process.env.EVENTS_API_BASE;
    if (!base) throw new Error("Missing env EVENTS_API_BASE");

    const r = await fetch(`${base}/api/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event)
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.error("EVENTS_API error:", r.status, txt);
      return res.status(500).json({ ok: false, error: "events_api_failed" });
    }

    // ✅ SFMC espera 200
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("EXECUTE ERROR:", e);
    return res.status(500).json({ ok: false, error: "execute_failed", details: String(e?.message || e) });
  }
};