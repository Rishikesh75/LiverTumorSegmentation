import { UserProfileMenu } from '@presentation/components/UserProfileMenu'
import { NavLink, Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="app-nav" aria-label="Main">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/upload">Upload volume</NavLink>
        </nav>
        <div className="app-user">
          <UserProfileMenu />
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
