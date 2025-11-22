'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
    const { data: session, status } = useSession()
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Don't show navbar on login page
    if (pathname === '/') return null

    if (status !== 'authenticated') return null

    const isActive = (path: string) => pathname === path

    return (
        <nav style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--border)',
            padding: '1rem',
            position: 'sticky',
            top: 0,
            zIndex: 50
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-all hover:scale-105" style={{ textDecoration: 'none' }}>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.5 4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                    </div>
                    <span className="text-2xl font-black tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: 'var(--foreground)' }}>
                        lockr flow
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link
                        href="/dashboard"
                        style={{
                            textDecoration: 'none',
                            color: isActive('/dashboard') ? 'var(--primary)' : 'var(--foreground)',
                            fontWeight: isActive('/dashboard') ? 'bold' : 'normal',
                            opacity: isActive('/dashboard') ? 1 : 0.7
                        }}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/scan"
                        style={{
                            textDecoration: 'none',
                            color: isActive('/scan') ? 'var(--primary)' : 'var(--foreground)',
                            fontWeight: isActive('/scan') ? 'bold' : 'normal',
                            opacity: isActive('/scan') ? 1 : 0.7
                        }}
                    >
                        Scan Package
                    </Link>
                    <div style={{ width: '2px', height: '24px', background: 'var(--border)', opacity: 0.5 }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--foreground)', opacity: 0.7 }}>
                            {session?.user?.name} ({session?.user?.role})
                        </span>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 'bold'
                            }}
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{ display: 'none', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--foreground)' }}
                >
                    ☰
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid var(--border)',
                    marginTop: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--foreground)' }}>Dashboard</Link>
                    <Link href="/scan" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--foreground)' }}>Scan Package</Link>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', width: '100%' }} />
                    <div style={{ color: 'var(--foreground)', fontSize: '0.875rem', opacity: 0.7 }}>{session?.user?.name}</div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            textAlign: 'left',
                            padding: 0,
                            fontWeight: 'bold'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            )}

            <style jsx>{`
                @media (max-width: 768px) {
                    .desktop-menu {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: block !important;
                    }
                }
            `}</style>
        </nav>
    )
}
