'use client'

import { useEffect, useState } from 'react'

export default function PackagesTab() {
    const [packages, setPackages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [visiblePins, setVisiblePins] = useState<Set<string>>(new Set())

    useEffect(() => {
        fetchPackages()
    }, [])

    const fetchPackages = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/packages')
            if (res.ok) {
                const data = await res.json()
                setPackages(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const togglePin = (id: string) => {
        const newPins = new Set(visiblePins)
        if (newPins.has(id)) {
            newPins.delete(id)
        } else {
            newPins.add(id)
        }
        setVisiblePins(newPins)
    }

    const handleMarkPickedUp = async (id: string) => {
        if (!confirm('Mark this package as picked up?')) return

        try {
            const res = await fetch(`/api/packages/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'PICKED_UP' })
            })
            if (res.ok) {
                fetchPackages() // Refresh list
            } else {
                alert('Failed to update status')
            }
        } catch (e) {
            console.error(e)
            alert('Error updating status')
        }
    }

    const handleExportCsv = () => {
        const headers = ['ID', 'Recipient Name', 'Recipient Email', 'Locker', 'PIN', 'Status', 'Created At', 'Picked Up At']
        const csvContent = [
            headers.join(','),
            ...packages.map(pkg => [
                pkg.id,
                `"${pkg.recipient.name}"`,
                pkg.recipient.email,
                pkg.locker.lockerNumber,
                pkg.pin,
                pkg.status,
                new Date(pkg.createdAt).toLocaleString(),
                pkg.pickedUpAt ? new Date(pkg.pickedUpAt).toLocaleString() : ''
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `packages_report_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    const filteredPackages = packages.filter(pkg =>
        pkg.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.locker.lockerNumber.includes(searchTerm)
    )

    if (loading) return <div className="p-8 text-center text-gray-500">Loading packages...</div>

    return (
        <div className="grid gap-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <input
                    type="text"
                    placeholder="Search by Name or Locker..."
                    className="input md:w-1/3"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button onClick={handleExportCsv} className="btn btn-success">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    Export CSV Report
                </button>
            </div>

            {/* Mobile hint - only visible on mobile */}
            <div className="block md:hidden text-sm" style={{ color: 'var(--foreground)', opacity: 0.6, textAlign: 'center', padding: '0.5rem' }}>
                ← Slide to see more details →
            </div>

            {/* Packages List */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                            <tr style={{ background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left', color: 'var(--foreground)', opacity: 0.7, borderRight: '1px solid var(--border)' }}>Photo</th>
                                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left', color: 'var(--foreground)', opacity: 0.7, borderRight: '1px solid var(--border)' }}>Recipient</th>
                                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left', color: 'var(--foreground)', opacity: 0.7, borderRight: '1px solid var(--border)' }}>Locker</th>
                                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left', color: 'var(--foreground)', opacity: 0.7, borderRight: '1px solid var(--border)' }}>PIN</th>
                                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left', color: 'var(--foreground)', opacity: 0.7, borderRight: '1px solid var(--border)' }}>Status</th>
                                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left', color: 'var(--foreground)', opacity: 0.7, borderRight: '1px solid var(--border)' }}>Time Log</th>
                                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left', color: 'var(--foreground)', opacity: 0.7 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPackages.map(pkg => (
                                <tr key={pkg.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="hover:bg-gray-50">
                                    <td style={{ padding: '1rem', borderRight: '1px solid var(--border)' }}>
                                        {pkg.photoUrl ? (
                                            <a href={pkg.photoUrl} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                <img src={pkg.photoUrl} alt="Package" className="w-full h-full object-cover" />
                                            </a>
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                                No Photo
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', borderRight: '1px solid var(--border)' }}>
                                        <div style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>{pkg.recipient.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--foreground)', opacity: 0.6 }}>{pkg.recipient.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem', borderRight: '1px solid var(--border)' }}>
                                        <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.125rem', color: 'var(--foreground)' }}>{pkg.locker.lockerNumber}</div>
                                    </td>
                                    <td style={{ padding: '1rem', borderRight: '1px solid var(--border)' }}>
                                        <button
                                            onClick={() => togglePin(pkg.id)}
                                            style={{
                                                fontSize: '0.75rem',
                                                background: 'var(--primary)',
                                                color: 'white',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0.5rem',
                                                border: 'none',
                                                fontFamily: 'monospace',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            {visiblePins.has(pkg.id) ? pkg.pin : 'Show PIN'}
                                        </button>
                                    </td>
                                    <td style={{ padding: '1rem', borderRight: '1px solid var(--border)' }}>
                                        <span style={{
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            background: pkg.status === 'PENDING' ? '#fef3c7' : '#d1fae5',
                                            color: pkg.status === 'PENDING' ? '#92400e' : '#065f46'
                                        }}>
                                            <span style={{
                                                width: '0.5rem',
                                                height: '0.5rem',
                                                borderRadius: '9999px',
                                                background: pkg.status === 'PENDING' ? '#f59e0b' : '#10b981'
                                            }}></span>
                                            {pkg.status === 'PICKED_UP' ? 'Picked Up' : pkg.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--foreground)', opacity: 0.7, borderRight: '1px solid var(--border)' }}>
                                        <div><span style={{ fontWeight: 600 }}>In:</span> {new Date(pkg.createdAt).toLocaleDateString()} {new Date(pkg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        {pkg.pickedUpAt && (
                                            <div style={{ color: '#059669' }}><span style={{ fontWeight: 600 }}>Out:</span> {new Date(pkg.pickedUpAt).toLocaleDateString()} {new Date(pkg.pickedUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {pkg.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleMarkPickedUp(pkg.id)}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                                    color: 'white',
                                                    padding: '0.625rem 1.25rem',
                                                    borderRadius: '0.5rem',
                                                    border: 'none',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)'
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)'
                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)'
                                                }}
                                            >
                                                Mark Picked Up
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredPackages.length === 0 && (
                        <div className="p-12 text-center text-gray-500 bg-gray-50">
                            <p className="text-lg font-medium">No packages found</p>
                            <p className="text-sm">Try adjusting your search terms</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
