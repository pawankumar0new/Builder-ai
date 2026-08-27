import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import api from '../api/api'
import LoginLeft from '../components/LoginLeft'
import { EyeOffIcon, EyeIcon, Loader2Icon } from 'lucide-react'

const AuthPage = ({ mode }) => {

  const {login, register} = useAppContext()


  const navigate = useNavigate()
  const { retrySession } = useAppContext()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const isRegister = mode === 'register'

  const isLogin = mode === "login"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try{
      if(mode === "login"){
        await login(email, password)
      }else{
        await register(name, email, password)
      }
      navigate("/")

    }catch(err){
      setError(err.message || (mode === "login" ? "Invalid email or password" : "Registration failed"))
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex text-zinc-900 font-sans">
      {/* <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
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
      </form> */}
      {/*Left Panel - Branding*/}
      <LoginLeft/>

      {/*Right Panel - Branding*/}
        <div className='flex-1 flex items-center justify-center p-8'>
          <div className='w-full max-w-sm'>
            <div className='mb-10'>
              <h1 className='text-3xl font-medium tracking-tight text-zinc-900 mb-1.5 font-sans'>{isLogin ? "Sign in" : "Create an account"}</h1>
              <p className='text-sm text-zinc-400'>
                {isLogin ? "Enter your credentials to access your website builder." : "Get started by entering your registration details"}
              </p>

            </div>
            {error && <div role='alert' className='mb-6 p-3 border border-red-200 bg-red-50 text-red-700 text-xs rounded'>{error}</div>}
            <form className='space-y-6' onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label htmlFor='name' className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                    Full Name
                  </label>
                  <input id='name' type= "text" value={name} onChange={(e)=> setName(e.target.value)} required className='w-full pl-2 py-2 border-2 border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm text-zinc-900 bg-transparent placeholder-zinc-300 transition-colors' placeholder='john doe'/>
                </div>
              )}
               <div>
                  <label htmlFor='email' className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                    Email Address 
                  </label>
                  <input id='email' type= "email" value={email} onChange={(e)=> setEmail(e.target.value)} required className='w-full pl-2 py-2 border-2 border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm text-zinc-900 bg-transparent placeholder-zinc-300 transition-colors' placeholder='you@example.com'/>
                </div>

                <div>
                  <label htmlFor='password' className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                    Password 
                  </label>
                  <div className='relative'>
                    <input id='password' type= {showPassword ? "text" : "password"} value={password} onChange={(e)=> setPassword(e.target.value)} required className='w-full pl-2 py-2 border-2 border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm text-zinc-900 bg-transparent placeholder-zinc-300 pr-8' placeholder='••••••••'/>
                    <button type='button' aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={()=>setShowPassword(!showPassword)} className='absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 flex items-center justify-center cursor-pointer transition-colors'>
                      {showPassword ? <EyeOffIcon size={14}/> : <EyeIcon size={14}/>}
                    </button>
                  </div>
                  
                </div>

                <button type='submit' disabled={loading} className='w-full py-2.5 bg-linear-to-br from-red-600 to-amber-600 text-white font-semibold hover:scale-102 disabled:opacity-40 flex items-center justify-center cursor-pointer mt-2 rounded-lg transition-all'>
                  {loading && <Loader2Icon className='animate-spin h-3.5 w-3.5 mr-2 '/>}
                  {isLogin ? "Sign in" : "Sign up"}
                </button>

            </form>
            <p className='text-sm text-zinc-400 mt-8 pt-6 border-t border-zinc-100 font-sans'>
              {isLogin ?(
                <>
                  New to BuilderAI?{" "}
                  <Link to="/register" className="text-zinc-900 font-medium hover:underline">
                    Create an account
                  </Link>
                </>
              ):(
                <>
                  Already have an account?{" "}
                  <Link to="/login" className="text-zinc-900 font-medium hover:underline"> Sign is here</Link>
                </>
              )}
            </p>
          </div>

        </div>

    </div>
  )
}

export default AuthPage