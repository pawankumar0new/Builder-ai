import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import api from '../api/api'

const AuthPage = ({ mode }) => {
  const navigate = useNavigate()
  const { retrySession } = useAppContext()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isRegister = mode === 'register'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post(`/api/auth/${isRegister ? 'register' : 'login'}`, form)
      const session = await retrySession()
      if (session.authenticated) {
        navigate('/', { replace: true })
      } else {
        setError('Authentication succeeded, but the session could not be confirmed. Please try again.')
      }
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to authenticate. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Builder AI</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">{isRegister ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mt-2 text-zinc-500">{isRegister ? 'Start building your next idea.' : 'Sign in to continue building.'}</p>
        </div>
        {isRegister && (
          <label className="block text-sm font-medium">
            Name
            <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-lg border border-zinc-200 px-4 py-3" />
          </label>
        )}
        <label className="block text-sm font-medium">
          Email
          <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-lg border border-zinc-200 px-4 py-3" />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-lg border border-zinc-200 px-4 py-3" />
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button disabled={submitting} className="w-full rounded-lg bg-zinc-950 px-4 py-3 font-semibold text-white disabled:opacity-60">
          {submitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}

export default AuthPage