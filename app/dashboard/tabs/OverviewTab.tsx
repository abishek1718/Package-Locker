'use client'

import { useEffect, useState } from 'react'

export default function OverviewTab() {
    const [lockers, setLockers] = useState<any[]>([])
    const [packages, setPackages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resLockers, resPackages] = await Promise.all([
                    fetch('/api/lockers'),
                    fetch('/api/packages')
                ])
                if (resLockers.ok) setLockers(await resLockers.json())
                if (resPackages.ok) setPackages(await resPackages.json())
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <div className="p-8 text-center text-gray-500">Loading stats...</div>

    // Calculate stats
    const availableLockers = lockers.filter(l => l.status === 'AVAILABLE').length
    const pendingPackages = packages.filter(p => p.status === 'PENDING').length

    return (
        <div className="grid gap-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{availableLockers}</div>
                    <div className="text-sm text-gray-600">Available Lockers</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-3xl font-bold text-orange-500">{pendingPackages}</div>
                    <div className="text-sm text-gray-600">Pending Pickups</div>
                </div>
            </div>

            {/* Locker Matrix */}
            <div>
                <h2 className="mb-16 text-xl font-bold text-gray-800 flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="9" x2="9" y1="21" y2="9" /></svg>
                    </div>
                    Package Lockers
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '1rem'
                }}>
                    {lockers.map((locker: any) => (
                        <div key={locker.id} className="glass-card p-3 text-center transition-all hover:scale-105 hover:shadow-md" style={{
                            border: `2px solid ${locker.status === 'AVAILABLE' ? '#22c55e' : '#ef4444'}`,
                            background: locker.status === 'AVAILABLE' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                            borderRadius: '12px',
                            cursor: 'default',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '80px'
                        }}>
                            <div className="text-xl font-bold text-gray-800 mb-1">{locker.lockerNumber}</div>
                            <div style={{
                                color: locker.status === 'AVAILABLE' ? '#15803d' : '#b91c1c',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {locker.status === 'AVAILABLE' ? 'Available' : 'Occupied'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
