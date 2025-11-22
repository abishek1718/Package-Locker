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

    if (loading) return <div>Loading stats...</div>

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

            {/* Locker Grid */}
            <div>
                <h2 className="mb-4 text-xl font-bold">Locker Status</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {lockers.map((locker: any) => (
                        <div key={locker.id} className="glass-card p-4 text-center" style={{
                            borderLeft: `5px solid ${locker.status === 'AVAILABLE' ? '#22c55e' : '#ef4444'}`
                        }}>
                            <div className="text-2xl font-bold mb-1">{locker.lockerNumber}</div>
                            <div style={{
                                color: locker.status === 'AVAILABLE' ? '#22c55e' : '#ef4444',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}>
                                {locker.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
