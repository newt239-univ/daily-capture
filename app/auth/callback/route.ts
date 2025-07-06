import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('認証エラー:', error)
        return NextResponse.redirect(new URL('/signin?error=認証に失敗しました', request.url))
      }
    } catch (error) {
      console.error('認証処理エラー:', error)
      return NextResponse.redirect(new URL('/signin?error=認証に失敗しました', request.url))
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}