// src/context/AuthContext.tsx
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface User {
    username: string
    role: string
}

interface AuthContextType {
    user: User | null
    login: (username: string, password: string) => boolean
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('user')
        return saved ? (JSON.parse(saved) as User) : null
    })

    const login = (username: string, password: string): boolean => {
        if (username === 'admin' && password === '1234') {
            const userData: User = { username, role: 'admin' }
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
            return true
        }
        return false
    }

    const logout = (): void => {
        setUser(null)
        localStorage.removeItem('user')
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
    return context
}