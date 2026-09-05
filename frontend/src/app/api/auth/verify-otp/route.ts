import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const body = await request.json()
  
  if (!body.code || body.code.length !== 6) {
    return NextResponse.json({ error: "Invalid code", code: "BAD_REQUEST" }, { status: 400 })
  }

  // In demo mode, accept any 6 digit code for OTP
  const user = { id: "3", name: "OTP User", email: "otpuser@dealflow360.com", phone: "+15559876543" }
  const cookieStore = await cookies()
  cookieStore.set('session', JSON.stringify(user), { httpOnly: true, path: '/' })
  
  return NextResponse.json({ user })
}
