import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const body = await request.json()
  
  if (!body.email) {
    return NextResponse.json({ error: "Email is required", code: "BAD_REQUEST" }, { status: 400 })
  }

  // Mock validation (Demo mode)
  if (body.email === "demo@dealflow360.com" || body.email) {
    const user = { id: "1", name: "Demo User", email: body.email, phone: "+15551234567" }
    
    // Set httpOnly cookie for mock session
    const cookieStore = await cookies()
    cookieStore.set('session', JSON.stringify(user), { httpOnly: true, path: '/' })
    
    return NextResponse.json({ user })
  }
  
  return NextResponse.json({ error: "Invalid credentials", code: "UNAUTHORIZED" }, { status: 401 })
}
