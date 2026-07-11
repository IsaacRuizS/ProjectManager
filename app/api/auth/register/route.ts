import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { usersCollection } from "@/lib/db/collections";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/token";
import { setSessionCookie } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const users = await usersCollection();

  const existing = await users.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Ese correo ya está registrado" }, { status: 409 });
  }

  const password_hash = await hashPassword(password);
  const _id = new ObjectId();
  await users.insertOne({
    _id,
    name,
    email,
    password_hash,
    role: "member",
    created_at: new Date(),
  });

  const token = await createSessionToken({
    sub: _id.toString(),
    email,
    name,
    role: "member",
  });
  await setSessionCookie(token);

  return NextResponse.json({ id: _id.toString(), name, email }, { status: 201 });
}
