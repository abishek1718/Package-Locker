'use client'

import { useEffect, useState } from 'react'

export default function RecipientsTab() {
    const [recipients, setRecipients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Form States
    const [newRecipient, setNewRecipient] = useState({ name: '', email: '' })
    const [addingRecipient, setAddingRecipient] = useState(false)
    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [uploadingCsv, setUploadingCsv] = useState(false)

    useEffect(() => {
        fetchRecipients()
    }, [])

    const fetchRecipients = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/recipients')
            if (res.ok) {
                const data = await res.json()
                setRecipients(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAddRecipient = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddingRecipient(true)
        try {
            const res = await fetch('/api/recipients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecipient)
            })
            if (res.ok) {
                alert('Recipient added successfully')
                setNewRecipient({ name: '', email: '' })
                fetchRecipients()
            } else {
                const data = await res.json()
                alert(data.error || 'Error adding recipient')
            }
        } catch (e) {
            console.error(e)
            alert('Network error: Unable to add recipient')
        }
        setAddingRecipient(false)
    }

    const handleCsvUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!csvFile) return

        setUploadingCsv(true)
        const formData = new FormData()
        formData.append('file', csvFile)

        try {
            const res = await fetch('/api/recipients/upload', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()

            if (res.ok) {
                alert(`Imported ${data.successCount} recipients successfully.\n${data.errors.length > 0 ? `Errors:\n${data.errors.join('\n')}` : ''}`)
                setCsvFile(null)
                fetchRecipients()
            } else {
                alert(data.error || 'Upload failed')
            }
        } catch (err) {
            console.error(err)
            alert('Upload failed')
        }
        setUploadingCsv(false)
    }

    const filteredRecipients = recipients.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="grid gap-8">
            {/* Action Forms */}
            <div className="grid md:grid-cols-2 gap-6" style={{ marginTop: '1rem' }}>
                {/* Add Single Recipient */}
                <div className="glass-card p-4 md:p-6">
                    <h2 className="text-xl font-bold mb-6">Add New Recipient</h2>
                    <form onSubmit={handleAddRecipient} className="grid gap-4">
                        <input
                            className="input"
                            placeholder="Name"
                            value={newRecipient.name}
                            onChange={e => setNewRecipient({ ...newRecipient, name: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            type="email"
                            placeholder="Email"
                            value={newRecipient.email}
                            onChange={e => setNewRecipient({ ...newRecipient, email: e.target.value })}
                            required
                        />
                        <button type="submit" className="btn btn-primary w-full" disabled={addingRecipient}>
                            {addingRecipient ? 'Adding...' : 'Add Recipient'}
                        </button>
                    </form>
                </div>

                {/* Bulk CSV Upload */}
                <div className="glass-card p-4 md:p-6">
                    <h2 className="text-xl font-bold mb-4">Bulk Import Recipients</h2>
                    <p className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.7, marginBottom: '1rem' }}>
                        Upload a CSV file with columns: <strong>Name, Email</strong>
                    </p>
                    <form onSubmit={handleCsvUpload} className="grid gap-4">
                        <input
                            type="file"
                            accept=".csv"
                            className="input"
                            onChange={e => setCsvFile(e.target.files?.[0] || null)}
                            required
                        />
                        <button type="submit" className="btn btn-primary w-full" disabled={uploadingCsv || !csvFile}>
                            {uploadingCsv ? 'Uploading...' : 'Upload CSV'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Recipients List */}
            <div style={{ marginTop: '2rem' }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold" style={{ whiteSpace: 'nowrap' }}>Recipient Directory</h2>
                    <input
                        type="text"
                        placeholder="Search recipients..."
                        className="input w-full md:w-64"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Mobile slide hint */}
                <div className="block md:hidden text-sm" style={{ color: 'var(--foreground)', opacity: 0.6, textAlign: 'center', padding: '0.5rem', marginBottom: '0.5rem' }}>
                    ← Slide to see more details →
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left', color: 'var(--foreground)', opacity: 0.7, borderRight: '1px solid var(--border)', minWidth: '200px' }}>Name</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left', color: 'var(--foreground)', opacity: 0.7, borderRight: '1px solid var(--border)', minWidth: '250px' }}>Email</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left', color: 'var(--foreground)', opacity: 0.7, minWidth: '150px' }}>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={3} className="p-8 text-center">Loading...</td></tr>
                                ) : filteredRecipients.map(r => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="hover:bg-gray-50">
                                        <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--foreground)', borderRight: '1px solid var(--border)' }}>{r.name}</td>
                                        <td style={{ padding: '1rem', color: 'var(--foreground)', opacity: 0.7, borderRight: '1px solid var(--border)' }}>{r.email}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--foreground)', opacity: 0.6 }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!loading && filteredRecipients.length === 0 && (
                            <div className="p-8 text-center text-gray-500">No recipients found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
