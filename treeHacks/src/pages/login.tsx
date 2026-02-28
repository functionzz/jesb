import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { fetchProfile, getLoginUrl } from '@/lib/auth'

export default function LoginPage() {
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [statusMessage, setStatusMessage] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  const fromPath = (location.state as { from?: string } | null)?.from ?? '/canvas'

  useEffect(() => {
    let isMounted = true

    async function checkSession() {
      const profile = await fetchProfile()
      if (!isMounted) return

      if (profile?.user) {
        navigate(fromPath, { replace: true })
        return
      }

      setIsCheckingSession(false)
    }

    checkSession()

    return () => {
      isMounted = false
    }
  }, [fromPath, navigate])

  const handleSignIn = () => {
    setStatusMessage('Redirecting to Auth0 login...')
    window.location.href = getLoginUrl(fromPath)
  }

  const handleSignUp = () => {
    setStatusMessage('Redirecting to Auth0 sign up...')
    window.location.href = getLoginUrl(fromPath, true)
  }

  if (isCheckingSession) {
    return (
      <div className='min-h-screen flex items-center justify-center p-6 bg-slate-950'>
        <p className='text-slate-200'>Checking your session...</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-6 bg-slate-950'>
      <div className='w-full max-w-md border border-slate-800 rounded-2xl bg-slate-900 p-8 flex flex-col gap-6'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-white'>TreeHacks</h1>
          <p className='text-slate-400 text-sm mt-2'>
            Continue with Auth0 to access your canvases.
          </p>
        </div>

        <div className='flex flex-col gap-3'>
          <Button onClick={handleSignIn} className='w-full'>
            Sign in with Auth0
          </Button>
          <Button onClick={handleSignUp} className='w-full' variant='secondary'>
            Sign up with Auth0
          </Button>
        </div>

        <p className='text-xs text-slate-400 text-center'>
          You will be redirected to the hosted Auth0 Universal Login page.
        </p>

        {statusMessage && (
          <p className='text-xs text-slate-300 text-center'>{statusMessage}</p>
        )}
      </div>
    </div>
  )
}