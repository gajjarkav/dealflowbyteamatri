import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  
  if (!body.email) {
    return NextResponse.json({ error: "Email is required", code: "BAD_REQUEST" }, { status: 400 })
  }

  // Generate 6-digit mock code
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  console.warn(`[DEMO] OTP for ${body.email} is: ${code}`)

  return NextResponse.json({ success: true, message: "OTP sent" })
}
