export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    console.log("=== EXECUTE CALLED ===");
    console.log(JSON.stringify(req.body, null, 2));

    // OK mínimo para Journey Builder
    return res.status(200).json({ status: "ok" });
}