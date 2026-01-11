export default async function handler(req, res) {
    try {
        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

        console.log("BODY COMPLETO:", JSON.stringify(body, null, 2));

        const inArguments = body?.inArguments?.[0] || {};
        console.log("IN_ARGUMENTS:", JSON.stringify(inArguments, null, 2));

        return res.status(200).json({ success: true });
    } catch (e) {
        console.error("ERROR:", e);
        return res.status(500).json({ success: false });
    }
}