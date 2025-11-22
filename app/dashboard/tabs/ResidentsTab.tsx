'use client'

import { useEffect, useState } from 'react'

export default function ResidentsTab() {
    const [residents, setResidents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Form States
    const [newResident, setNewResident] = useState({ name: '', email: '', unitNumber: '' })
    const [addingResident, setAddingResident] = useState(false)
    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [uploadingCsv, setUploadingCsv] = useState(false)

    useEffect(() => {
        fetchResidents()
    }, [])

    const fetchResidents = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/residents')
            if (res.ok) {
                const data = await res.json()
                setResidents(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAddResident = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddingResident(true)
        try {
            const res = await fetch('/api/residents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newResident)
            })
            if (res.ok) {
                alert('Resident added successfully')
                setNewResident({ name: '', email: '', unitNumber: '' })
                fetchResidents()
            } else {
                alert('Error adding resident')
            }
        } catch (e) {
            console.error(e)
        }
        setAddingResident(false)
    }

    const handleCsvUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!csvFile) return

        setUploadingCsv(true)
        const formData = new FormData()
        formData.append('file', csvFile)

        try {
            const res = await fetch('/api/residents/upload', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()

            if (res.ok) {
                alert(`Imported ${data.successCount} residents successfully.\n${data.errors.length > 0 ? `Errors:\n${data.errors.join('\n')}` : ''}`)
                setCsvFile(null)
                fetchResidents()
            } else {
                alert(data.error || 'Upload failed')
            }
        } catch (err) {
            console.error(err)
            alert('Upload failed')
        }
        setUploadingCsv(false)
    }

    const filteredResidents = residents.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.unitNumber.includes(searchTerm)
    )

    return (
        <div className="grid gap-8">
            {/* Action Forms */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Add Single Resident */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Add New Resident</h2>
                    <form onSubmit={handleAddResident} className="grid gap-4">
                        <input
                            className="input"
                            placeholder="Name"
                            value={newResident.name}
                            onChange={e => setNewResident({ ...newResident, name: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            type="email"
                            placeholder="Email"
                            value={newResident.email}
                            onChange={e => setNewResident({ ...newResident, email: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            placeholder="Unit Number"
                            value={newResident.unitNumber}
                            onChange={e => setNewResident({ ...newResident, unitNumber: e.target.value })}
                            required
                        />
                        <button type="submit" className="btn btn-primary" disabled={addingResident}>
                            {addingResident ? 'Adding...' : 'Add Resident'}
                        </button>
                    </form>
                </div>

                {/* Bulk CSV Upload */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Bulk Import Residents</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Upload a CSV file with columns: <strong>Name, Email, UnitNumber</strong>
                    </p>
                    <form onSubmit={handleCsvUpload} className="grid gap-4">
                        <input
                            type="file"
                            accept=".csv"
                            className="input"
                            onChange={e => setCsvFile(e.target.files?.[0] || null)}
                            required
                        />
                        <button type="submit" className="btn btn-primary" disabled={uploadingCsv || !csvFile}>
                            {uploadingCsv ? 'Uploading...' : 'Upload CSV'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Residents List */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Resident Directory</h2>
                    <input
                        type="text"
                        placeholder="Search residents..."
                        className="input w-64"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="glass-card overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-left border-b border-gray-200">
                                <th className="p-4">Name</th>
                                <th className="p-4">Unit</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center">Loading...</td></tr>
                            ) : filteredResidents.map(r => (
                                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-4 font-bold">{r.name}</td>
                                    <td className="p-4">{r.unitNumber}</td>
                                    <td className="p-4 text-gray-600">{r.email}</td>
                                    <td className="p-4 text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && filteredResidents.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No residents found.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
