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
                <h2 className="mb-4 text-xl font-bold">Locker Matrix</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: '0.75rem'
                }}>
                    {lockers.map((locker: any) => (
                        <div key={locker.id} className="glass-card p-2 text-center transition-transform hover:scale-105" style={{
                            border: `2px solid ${locker.status === 'AVAILABLE' ? '#22c55e' : '#ef4444'}`,
                            background: locker.status === 'AVAILABLE' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                            borderRadius: '8px',
                            cursor: 'default'
                        }}>
                            <div className="text-lg font-bold text-gray-800">{locker.lockerNumber}</div>
                            <div style={{
                                color: locker.status === 'AVAILABLE' ? '#22c55e' : '#ef4444',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}>
                                {locker.status === 'AVAILABLE' ? 'Free' : 'Busy'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
