module.exports = (req, res) => {
  console.log("BODY:", JSON.stringify(req.body, null, 2));

  const inArgs = req.body?.inArguments || [];
  const merged = Object.assign({}, ...inArgs);

  console.log("IN_ARGUMENTS:", inArgs);
  console.log("MERGED:", merged);

  res.status(200).json({ ok: true });
};