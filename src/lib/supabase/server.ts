import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export const createClient = (request?: NextRequest) => {
  let cookieStore;

  if (request) {
    // If a request is provided, use it to get the cookies.
    // This is for use in middleware.
    cookieStore = request.cookies
  } else {
    // Otherwise, get the cookies from the Next.js headers store.
    // This is for use in Server Components.
    cookieStore = cookies()
  }

  const response = NextResponse.next({
    request: {
      headers: request?.headers || new Headers(),
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          if (request) {
            // In middleware, we can set the cookie on the request and response.
            request.cookies.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          } else {
            // In Server Components, we can only set the cookie on the response.
            // We use the `cookies()` function from `next/headers` to do this.
            cookies().set({ name, value, ...options })
          }
        },
        remove(name: string, options: CookieOptions) {
          if (request) {
            // In middleware, we can delete the cookie on the request and response.
            request.cookies.set({ name, value: '', ...options })
            response.cookies.set({ name, value: '', ...options })
          } else {
            // In Server Components, we can only delete the cookie on the response.
            cookies().set({ name, value: '', ...options })
          }
        },
      },
    }
  )

  return { supabase, response }
}
