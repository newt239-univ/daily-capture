'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignInPage() {
  const router = useRouter()
  const [redirectUrl, setRedirectUrl] = useState<string>('')

  useEffect(() => {
    // クライアントサイドでのみ window.location.origin を使用
    setRedirectUrl(`${window.location.origin}/auth/callback`)

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/')
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  // redirectUrl が設定されるまでローディング表示
  if (!redirectUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Daily Capture
          </h1>
          <p className="text-gray-600">
            毎日同じ場所の写真を共有するSNS
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#3b82f6',
                  brandAccent: '#2563eb',
                  brandButtonText: 'white',
                  defaultButtonBackground: '#f8fafc',
                  defaultButtonBackgroundHover: '#f1f5f9',
                  defaultButtonBorder: '#e2e8f0',
                  defaultButtonText: '#334155',
                  dividerBackground: '#e2e8f0',
                  inputBackground: '#f8fafc',
                  inputBorder: '#e2e8f0',
                  inputBorderHover: '#cbd5e1',
                  inputBorderFocus: '#3b82f6',
                  inputText: '#1e293b',
                  inputLabelText: '#475569',
                  inputPlaceholder: '#94a3b8',
                  messageText: '#1e293b',
                  messageTextDanger: '#dc2626',
                  anchorTextColor: '#3b82f6',
                  anchorTextHoverColor: '#2563eb',
                },
                space: {
                  spaceSmall: '4px',
                  spaceMedium: '8px',
                  spaceLarge: '16px',
                  labelBottomMargin: '4px',
                  anchorBottomMargin: '4px',
                  emailInputSpacing: '4px',
                  socialAuthSpacing: '4px',
                  buttonPadding: '12px 24px',
                  inputPadding: '12px 16px',
                },
                fontSizes: {
                  baseBodySize: '14px',
                  baseInputSize: '16px',
                  baseLabelSize: '14px',
                  baseButtonSize: '16px',
                },
                fonts: {
                  bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                  buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                  inputFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                  labelFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                },
                borderWidths: {
                  buttonBorderWidth: '1px',
                  inputBorderWidth: '1px',
                },
                radii: {
                  borderRadiusButton: '8px',
                  buttonBorderRadius: '8px',
                  inputBorderRadius: '8px',
                },
              },
            },
          }}
          providers={['google', 'github']}
          redirectTo={redirectUrl}
          localization={{
            variables: {
              sign_in: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                email_input_placeholder: 'メールアドレスを入力してください',
                password_input_placeholder: 'パスワードを入力してください',
                button_label: 'サインイン',
                loading_button_label: 'サインイン中...',
                social_provider_text: '{{provider}}でサインイン',
                link_text: 'すでにアカウントをお持ちですか？サインイン',
              },
              sign_up: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                email_input_placeholder: 'メールアドレスを入力してください',
                password_input_placeholder: 'パスワードを入力してください',
                button_label: 'アカウント作成',
                loading_button_label: 'アカウント作成中...',
                social_provider_text: '{{provider}}でアカウント作成',
                link_text: 'アカウントをお持ちでない場合はこちら',
              },
              magic_link: {
                email_input_label: 'メールアドレス',
                email_input_placeholder: 'メールアドレスを入力してください',
                button_label: 'マジックリンクを送信',
                loading_button_label: '送信中...',
                link_text: 'マジックリンクでサインイン',
              },
              forgotten_password: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                email_input_placeholder: 'メールアドレスを入力してください',
                button_label: 'パスワードリセット',
                loading_button_label: '送信中...',
                link_text: 'パスワードをお忘れですか？',
              },
              update_password: {
                password_label: '新しいパスワード',
                password_input_placeholder: '新しいパスワードを入力してください',
                button_label: 'パスワードを更新',
                loading_button_label: '更新中...',
              },
              verify_otp: {
                email_input_label: 'メールアドレス',
                email_input_placeholder: 'メールアドレスを入力してください',
                phone_input_label: '電話番号',
                phone_input_placeholder: '電話番号を入力してください',
                token_input_label: '認証コード',
                token_input_placeholder: '認証コードを入力してください',
                button_label: '認証',
                loading_button_label: '認証中...',
              },
            },
          }}
        />
      </div>
    </div>
  )
}