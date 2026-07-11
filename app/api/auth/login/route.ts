import { NextResponse } from "next/server";
import { usersCollection } from "@/lib/db/collections";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/token";
import { setSessionCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const users = await usersCollection();
  const user = await users.findOne({ email });

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const token = await createSessionToken({
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  });
  await setSessionCookie(token);

  return NextResponse.json({ id: user._id.toString(), name: user.name, email: user.email });
}
