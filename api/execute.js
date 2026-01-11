export default async function handler(req, res) {
  try {
    console.log("BODY COMPLETO:", JSON.stringify(req.body, null, 2));

    const inArgsArray = req.body?.inArguments || [];
    const merged = Object.assign({}, ...inArgsArray);

    console.log("IN_ARGUMENTS (MERGED):", JSON.stringify(merged, null, 2));

    return res.status(200).json({
      status: "ok",
      received: merged
    });
  } catch (err) {
    console.error("ERROR execute:", err);
    return res.status(500).json({ status: "error", message: err?.message });
  }
}