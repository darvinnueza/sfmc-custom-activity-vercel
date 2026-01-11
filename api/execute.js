module.exports = async (req, res) => {
  try {
    console.log("BODY COMPLETO:", JSON.stringify(req.body, null, 2));

    const inArgsArray = req.body?.inArguments || [];
    const merged = Object.assign({}, ...inArgsArray);

    console.log("IN_ARGUMENTS (RAW):", JSON.stringify(inArgsArray, null, 2));
    console.log("IN_ARGUMENTS (MERGED):", JSON.stringify(merged, null, 2));

    // Esto te ayuda a ver si SFMC está enviando solo keyValue/contactKey
    console.log("keyValue:", req.body?.keyValue);
    console.log("contactKey (top-level):", req.body?.contactKey);

    return res.status(200).json({ status: "ok", received: merged });
  } catch (err) {
    console.error("ERROR execute:", err);
    return res.status(500).json({ status: "error", message: err?.message });
  }
};