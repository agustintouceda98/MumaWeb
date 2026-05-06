// src/pages/Login.tsx
import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const { login, user } = useAuth()
    const navigate = useNavigate()
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<boolean>(false)

    if (user) return <Navigate to="/" replace />

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (login(username, password)) {
            navigate('/', { replace: true })
        } else {
            setError(true)
            setPassword('')
        }
    }

    const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setter(e.target.value)
            setError(false)
        }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: '#ffffff',
            fontFamily: "'Sora', sans-serif"
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@500&display=swap');
                .login-input { width: 100%; background: rgba(255,255,255,0.04); border: 0.5px solid rgba(255,255,255,0.1);
                    border-radius: 10px; padding: 11px 12px 11px 38px; font-size: 14px;
                    font-family: 'Sora', sans-serif; color: #000; outline: none;
                    transition: border-color .2s, background .2s; box-sizing: border-box; }
                .login-input::placeholder { color: '#08060d'; }
                .login-input:focus { border-color: rgba(250,246,241,0.8); background: rgba(220,199,175,0.05); }
                .login-btn { width: 100%; padding: 12px; background: rgba(220,199,175,1);
                    border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 500;
                    font-family: 'Sora', sans-serif; cursor: pointer; transition: opacity .2s, transform .15s; }
                .login-btn:hover { opacity: 0.9; transform: translateY(-1px); }
                .login-btn:active { transform: scale(0.98); }
            `}</style>

            <div style={{
                width: '100%', maxWidth: 400, background: '#F7EFEA',
                border: '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: '2.5rem', position: 'relative', overflow: 'hidden'
            }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 500, color: "#6b6375", letterSpacing: '0.05em' }}>
                        MUMA
                    </span>
                </div>

                <h1 style={{ fontSize: 22, fontWeight: 600, color: '#6b6375', margin: '0 0 6px', lineHeight: 1.2 }}>
                    Bienvenido de vuelta
                </h1>
                <p style={{ fontSize: 13, color: '#6b6375', margin: '0 0 2rem', fontWeight: 300 }}>
                    Ingresá tus credenciales para continuar
                </p>

                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.3)',
                        borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#f87171', marginBottom: '1rem'
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF0000', flexShrink: 0, display: 'inline-block' }} />
                        Usuario o contraseña incorrectos
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.85)', marginBottom: 6 }}>
                            Usuario
                        </label>
                        <div style={{ position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.3, pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="5.5" r="2.5" stroke="black" strokeWidth="1.2" />
                                <path d="M2.5 13C2.5 10.515 5.015 8.5 8 8.5C10.985 8.5 13.5 10.515 13.5 13" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                            <input className="login-input" type="text" placeholder="administrador" value={username} onChange={handleChange(setUsername)} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '0.25rem' }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.85)', marginBottom: 6 }}>
                            Contraseña
                        </label>
                        <div style={{ position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.3, pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <rect x="3" y="7" width="10" height="7" rx="2" stroke="black" strokeWidth="1.2" />
                                <path d="M5.5 7V5C5.5 3.619 6.619 2.5 8 2.5C9.381 2.5 10.5 3.619 10.5 5V7" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                            <input className="login-input" type="password" placeholder="••••••••" value={password} onChange={handleChange(setPassword)} />
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', margin: '6px 0 1.5rem' }}>
                        <a href="#" style={{ fontSize: 11, color: '#DCC7AF', textDecoration: 'none' }}>
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                    <button type="submit" className="login-btn">
                        Iniciar sesión
                    </button>
                </form>
            </div>
        </div>
    )
}