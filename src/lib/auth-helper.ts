import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return null

  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    return null
  }
}
