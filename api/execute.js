module.exports = async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    console.log("=== EXECUTE CALLED ===");
    console.log(JSON.stringify(req.body, null, 2));

    return res.status(200).json({ status: "ok" });
};