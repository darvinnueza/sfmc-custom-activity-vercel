export async function POST(req) {
    const body = await req.json().catch(() => ({}));
    console.log("EXECUTE BODY:", JSON.stringify(body, null, 2));

    return Response.json({ ok: true }, { status: 200 });
}