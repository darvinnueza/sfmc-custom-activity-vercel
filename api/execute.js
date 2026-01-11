export default async function handler(req, res) {
  try {
    console.log("BODY COMPLETO:", JSON.stringify(req.body, null, 2));

    const inArgs = req.body?.inArguments || [];
    console.log("IN_ARGUMENTS (RAW):", JSON.stringify(inArgs, null, 2));

    const merged = Object.assign({}, ...inArgs);
    console.log("IN_ARGUMENTS (MERGED):", JSON.stringify(merged, null, 2));

    return res.status(200).json({ status: "ok", received: merged });
  } catch (err) {
    console.error("ERROR execute:", err);
    return res.status(500).json({ status: "error", message: err?.message });
  }
}