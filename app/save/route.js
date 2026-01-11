export async function POST(req) {
    const body = await req.json().catch(() => ({}));
    console.log("SAVE BODY:", JSON.stringify(body, null, 2));
    return Response.json({ ok: true }, { status: 200 });
}

export async function GET() {
    return Response.json({ ok: true, endpoint: "save" }, { status: 200 });
}