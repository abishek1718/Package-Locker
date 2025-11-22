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
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '1rem',
            position: 'sticky',
            top: 0,
            zIndex: 50
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/dashboard" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none' }}>
                    📦 LockerSystem
                </Link>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link
                        href="/dashboard"
                        style={{
                            textDecoration: 'none',
                            color: isActive('/dashboard') ? 'var(--primary)' : '#666',
                            fontWeight: isActive('/dashboard') ? 'bold' : 'normal'
                        }}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/scan"
                        style={{
                            textDecoration: 'none',
                            color: isActive('/scan') ? 'var(--primary)' : '#666',
                            fontWeight: isActive('/scan') ? 'bold' : 'normal'
                        }}
                    >
                        Scan Package
                    </Link>
                    <div style={{ width: '1px', height: '24px', background: '#ddd' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#666' }}>
                            {session.user?.name} ({session.user?.role})
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
                    style={{ display: 'none', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                    ☰
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid #eee',
                    marginTop: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: '#333' }}>Dashboard</Link>
                    <Link href="/scan" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: '#333' }}>Scan Package</Link>
                    <hr style={{ border: 'none', borderTop: '1px solid #eee', width: '100%' }} />
                    <div style={{ color: '#666', fontSize: '0.875rem' }}>{session.user?.name}</div>
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
