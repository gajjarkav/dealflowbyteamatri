import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  
  if (!session) {
    return NextResponse.json({ user: null })
  }
  
  try {
    return NextResponse.json({ user: JSON.parse(session.value) })
  } catch {
    return NextResponse.json({ user: null })
  }
}
