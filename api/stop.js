module.exports = (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    return res.status(200).json({ valid: true }); // o published/ stopped según el archivo
};