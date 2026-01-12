export default async function handler(req, res) {
    try {
        const r = await fetch("https://custom-activity-service-demo.vercel.app/api/ui/contactlists");

        if (!r.ok) {
        const text = await r.text();
        return res.status(r.status).send(text);
        }

        const data = await r.json();
        return res.status(200).json(data);
    } catch (e) {
        console.error("Proxy contactlists error:", e);
        return res.status(500).json({ error: "Proxy error" });
    }
}