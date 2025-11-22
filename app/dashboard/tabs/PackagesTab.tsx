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
                <button onClick={handleExportCsv} className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    Export CSV Report
                </button>
            </div>

            {/* Packages List */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-left border-b border-gray-200 bg-gray-50">
                                <th className="p-4 font-semibold text-gray-600">Photo</th>
                                <th className="p-4 font-semibold text-gray-600">Recipient</th>
                                <th className="p-4 font-semibold text-gray-600">Locker</th>
                                <th className="p-4 font-semibold text-gray-600">PIN</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Time Log</th>
                                <th className="p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPackages.map(pkg => (
                                <tr key={pkg.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
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
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{pkg.recipient.name}</div>
                                        <div className="text-xs text-gray-500">{pkg.recipient.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-mono font-bold text-lg text-gray-700">{pkg.locker.lockerNumber}</div>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => togglePin(pkg.id)}
                                            className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-200 font-mono transition-colors"
                                        >
                                            {visiblePins.has(pkg.id) ? pkg.pin : 'Show PIN'}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${pkg.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full ${pkg.status === 'PENDING' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                            {pkg.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-gray-600 space-y-1">
                                        <div><span className="font-semibold">In:</span> {new Date(pkg.createdAt).toLocaleDateString()} {new Date(pkg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        {pkg.pickedUpAt && (
                                            <div className="text-green-700"><span className="font-semibold">Out:</span> {new Date(pkg.pickedUpAt).toLocaleDateString()} {new Date(pkg.pickedUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {pkg.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleMarkPickedUp(pkg.id)}
                                                className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow transition-all font-medium"
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
