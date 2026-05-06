import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login', { replace: true })
    }
    return (
        <>
            <style>{CSS}</style>
            <div className="app-shell">
                <header className="app-header">
                    {/* Logo */}
                    <div className="app-header__logo">
                        <span className="app-header__logo-text">Muma</span>
                    </div>

                    {/* Nav */}
                    <nav className="app-nav">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `app-nav__item ${isActive ? 'app-nav__item--active' : ''}`
                            }
                        >
                            Información de cajas
                        </NavLink>
                        <NavLink
                            to="/productos"
                            className={({ isActive }) =>
                                `app-nav__item ${isActive ? 'app-nav__item--active' : ''}`
                            }
                        >
                            Listado de Productos
                        </NavLink>
                    </nav>

                    {/* Usuario + logout */}
                    <div className="app-header__user">
                        <span className="app-header__username">{user?.username}</span>
                        <button className="app-header__logout" onClick={handleLogout}>
                            Cerrar sesión
                        </button>
                    </div>
                </header>

                <main className="app-main">
                    <Outlet />
                </main>
            </div>
        </>
    )
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');

  .app-shell {
    min-height: 100vh;
    background: #FAF6F1;
    display: flex;
    flex-direction: column;
  }

  /* Header */
  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    height: 60px;
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  /* Logo */
  .app-header__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }
  .app-header__logo-mark {
    width: 34px;
    height: 34px;
    background: #DCC7AF;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Serif Display', serif;
    font-size: 1.1rem;
    color: #5c4a3a;
    font-weight: 400;
  }
  .app-header__logo-text {
    font-family: 'DM Serif Display', serif;
    font-size: 1.25rem;
    color: #111827;
    letter-spacing: -.02em;
  }

  /* Nav */
  .app-nav {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .app-nav__item {
    padding: 6px 16px;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: .88rem;
    font-weight: 500;
    color: #6b7280;
    text-decoration: none;
    transition: background .15s, color .15s;
  }
  .app-nav__item:hover {
    background: #F5EFE7;
    color: #5c4a3a;
  }
  .app-nav__item--active {
    background: #DCC7AF;
    color: #5c4a3a;
    font-weight: 600;
  }

  /* Main */
  .app-main {
    flex: 1;
  }

  .app-header__user {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .app-header__username {
    font-family: 'DM Sans', sans-serif;
    font-size: .88rem;
    color: #6b7280;
  }

  .app-header__logout {
    padding: 6px 16px;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: .88rem;
    font-weight: 500;
    color: #5c4a3a;
    background: transparent;
    border: 1px solid #DCC7AF;
    cursor: pointer;
    transition: background .15s, color .15s;
  }

  .app-header__logout:hover {
    background: #F5EFE7;
  }
`