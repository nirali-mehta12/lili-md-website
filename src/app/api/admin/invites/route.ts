import { NextResponse, type NextRequest } from "next/server";
import { isAdmin, ADMIN_COOKIE } from "@/lib/admin";
import { createInvite, revokeInvite, listInvites } from "@/lib/invites";

/*
  Admin invite management (all require a valid admin session cookie):
    GET    -> list all invites
    POST   { label, ttlDays? } -> create a code, returns { code }
    DELETE ?id=<id>            -> revoke a code
*/

export const dynamic = "force-dynamic";

function authed(request: NextRequest): boolean {
  return isAdmin(request.cookies.get(ADMIN_COOKIE)?.value);
}

// Must return a FRESH response each call — a Response body can only be sent once.
const unauthorized = () =>
  NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

export async function GET(request: NextRequest) {
  if (!authed(request)) return unauthorized();
  return NextResponse.json({ ok: true, invites: await listInvites() });
}

export async function POST(request: NextRequest) {
  if (!authed(request)) return unauthorized();

  let body: { label?: string; ttlDays?: number | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const label = String(body.label || "").trim();
  if (!label) {
    return NextResponse.json({ ok: false, error: "Enter a name." }, { status: 400 });
  }
  const ttlDays =
    body.ttlDays && Number(body.ttlDays) > 0 ? Number(body.ttlDays) : null;

  const result = await createInvite({ label, ttlDays });
  if (!result) {
    return NextResponse.json(
      { ok: false, error: "Could not create code (database unavailable)." },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, id: result.id, code: result.code, label });
}

export async function DELETE(request: NextRequest) {
  if (!authed(request)) return unauthorized();
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }
  await revokeInvite(id);
  return NextResponse.json({ ok: true });
}
