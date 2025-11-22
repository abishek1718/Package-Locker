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
        const headers = ['ID', 'Resident Name', 'Resident Unit', 'Locker', 'PIN', 'Status', 'Created At', 'Picked Up At']
        const csvContent = [
            headers.join(','),
            ...packages.map(pkg => [
                pkg.id,
                `"${pkg.resident.name}"`,
                pkg.resident.unitNumber,
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
        pkg.resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.locker.lockerNumber.includes(searchTerm) ||
        pkg.resident.unitNumber.includes(searchTerm)
    )

    if (loading) return <div>Loading packages...</div>

    return (
        <div className="grid gap-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by Name, Unit, or Locker..."
                    className="input md:w-1/3"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button onClick={handleExportCsv} className="btn bg-green-600 text-white hover:bg-green-700">
                    Export CSV Report
                </button>
            </div>

            <div className="glass-card overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="text-left border-b border-gray-200">
                            <th className="p-4">Photo</th>
                            <th className="p-4">Resident</th>
                            <th className="p-4">Locker</th>
                            <th className="p-4">PIN</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Time Log</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPackages.map(pkg => (
                            <tr key={pkg.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-4">
                                    {pkg.photoUrl ? (
                                        <a href={pkg.photoUrl} target="_blank" rel="noopener noreferrer">
                                            <img src={pkg.photoUrl} alt="Package" className="w-12 h-12 object-cover rounded" />
                                        </a>
                                    ) : <span className="text-gray-400 text-xs">No Photo</span>}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold">{pkg.resident.name}</div>
                                    <div className="text-xs text-gray-500">Unit {pkg.resident.unitNumber}</div>
                                </td>
                                <td className="p-4 font-mono">{pkg.locker.lockerNumber}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => togglePin(pkg.id)}
                                        className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                                    >
                                        {visiblePins.has(pkg.id) ? pkg.pin : 'Show PIN'}
                                    </button>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${pkg.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {pkg.status}
                                    </span>
                                </td>
                                <td className="p-4 text-xs text-gray-600">
                                    <div>In: {new Date(pkg.createdAt).toLocaleDateString()} {new Date(pkg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    {pkg.pickedUpAt && (
                                        <div className="text-green-600">Out: {new Date(pkg.pickedUpAt).toLocaleDateString()} {new Date(pkg.pickedUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    )}
                                </td>
                                <td className="p-4">
                                    {pkg.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleMarkPickedUp(pkg.id)}
                                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
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
                    <div className="p-8 text-center text-gray-500">No packages found matching your search.</div>
                )}
            </div>
        </div>
    )
}
