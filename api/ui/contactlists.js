export default async function handler(req, res) {
    try {
        // ==============================
        // BASIC AUTH (cliente -> proxy)
        // ==============================
        const USER = process.env.BASIC_AUTH_USER;
        const PASS = process.env.BASIC_AUTH_PASS;

        if (!USER || !PASS) {
            return res.status(500).json({
                error: "missing_env",
                details: "BASIC_AUTH_USER / BASIC_AUTH_PASS"
            });
        }

        const basicAuth = Buffer
        .from(`${USER}:${PASS}`)
        .toString("base64");

        // ==============================
        // UPSTREAM (backend protegido)
        // ==============================
        const upstream = "https://custom-activity-service-demo.vercel.app/api/ui/contactlists";

        const r = await fetch(upstream, {
            method: "GET",
            headers: {
                // 🔐 Basic Auth hacia el backend
                Authorization: `Basic ${basicAuth}`
            }
        });

        if (!r.ok) {
            const text = await r.text().catch(() => "");
            return res.status(r.status).send(text || "Upstream error");
        }

        const data = await r.json();

        // ==============================
        // RESPONSE
        // ==============================
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "application/json");

        return res.status(200).json(data);
    } catch (e) {
        console.error("CONTACTLISTS PROXY ERROR:", e);
        return res.status(500).json({
            error: "proxy_error",
            details: String(e)
        });
    }
}