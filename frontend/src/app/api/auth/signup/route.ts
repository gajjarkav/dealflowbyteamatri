import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  
  if (!body.email || !body.name || !body.phone) {
    return NextResponse.json({ error: "Missing fields", code: "BAD_REQUEST" }, { status: 400 })
  }

  const user = { id: "2", name: body.name, email: body.email, phone: body.phone }
  
  // Do not set session cookie yet. Require OTP verification first.
  return NextResponse.json({ message: "User created, OTP required", tempUserId: user.id })
}
