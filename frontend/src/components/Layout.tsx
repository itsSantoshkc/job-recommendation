import { Link, useLocation, Outlet } from '@tanstack/react-router'
import { useAuth } from '../lib/auth'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/utils'
import { Menu, X, LogOut, LayoutDashboard, FileText, Clock, History } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { user, isAuthenticated, logout, isCompany, isUser } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = isCompany ? [
    { href: '/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/company/jobs/new', label: 'New Job', icon: FileText },
    { href: '/company/applications', label: 'Applications', icon: Clock },
    { href: '/company/jobs/past', label: 'Past Jobs', icon: History },
  ] : isUser ? [
    { href: '/resume-builder', label: 'Resume Builder', icon: FileText },
    { href: '/applications', label: 'My Applications', icon: History },
  ] : []

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gray-800 dark:bg-gray-900/95">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400" aria-label="Job Portal Home">
            JobPortal
          </Link>
          <div className="hidden md:flex md:gap-6">
            <Link to="/" className={cn('text-sm font-medium transition-colors hover:text-blue-600', location.pathname === '/' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300')}>
              Jobs
            </Link>
            {isAuthenticated && (
              <>
                {isCompany && navLinks.map(link => (
                  <Link key={link.href} to={link.href} className={cn('text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1', location.pathname === link.href ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300')}>
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
                {isUser && navLinks.map(link => (
                  <Link key={link.href} to={link.href} className={cn('text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1', location.pathname === link.href ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300')}>
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
                {user?.name}
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex sm:items-center sm:gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-gray-200 bg-white py-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-2 px-4">
            <Link to="/" className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300">Jobs</Link>
            {isAuthenticated ? (
              <>
                {isCompany && navLinks.map(link => (
                  <Link key={link.href} to={link.href} className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
                {isUser && navLinks.map(link => (
                  <Link key={link.href} to={link.href} className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
                <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300">Login</Link>
                <Link to="/register" className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2024 JobPortal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}