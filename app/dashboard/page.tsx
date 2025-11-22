'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [lockers, setLockers] = useState<any[]>([])
    const [packages, setPackages] = useState<any[]>([])

    // New Resident Form State
    const [newResident, setNewResident] = useState({ name: '', email: '', unitNumber: '' })
    const [addingResident, setAddingResident] = useState(false)

    // CSV Upload State
    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [uploadingCsv, setUploadingCsv] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/')
        if (status === 'authenticated') {
            fetchData()
        }
    }, [status, router])

    const fetchData = async () => {
        const [resLockers, resPackages] = await Promise.all([
            fetch('/api/lockers'),
            fetch('/api/packages')
        ])
        if (resLockers.ok) setLockers(await resLockers.json())
        if (resPackages.ok) setPackages(await resPackages.json())
    }

    const handleAddResident = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddingResident(true)
        const res = await fetch('/api/residents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newResident)
        })
        if (res.ok) {
            alert('Resident added successfully')
            setNewResident({ name: '', email: '', unitNumber: '' })
        } else {
            alert('Error adding resident')
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
            } else {
                alert(data.error || 'Upload failed')
            }
        } catch (err) {
            console.error(err)
            alert('Upload failed')
        }
        setUploadingCsv(false)
    }

    if (status === 'loading') return <div>Loading...</div>

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1>Admin Dashboard</h1>
            </div>

            {/* Admin Only Section */}
            {session?.user?.role === 'ADMIN' && (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    {/* Add Single Resident */}
                    <div className="glass-card">
                        <h2 style={{ marginBottom: '1rem' }}>Add New Resident</h2>
                        <form onSubmit={handleAddResident} className="grid" style={{ gap: '1rem' }}>
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
                    <div className="glass-card">
                        <h2 style={{ marginBottom: '1rem' }}>Bulk Import Residents</h2>
                        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                            Upload a CSV file with columns: <strong>Name, Email, UnitNumber</strong>
                        </p>
                        <form onSubmit={handleCsvUpload} className="grid" style={{ gap: '1rem' }}>
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
            )}

            {/* Lockers Grid */}
            <h2 style={{ marginBottom: '1rem' }}>Locker Status</h2>
            <div className="grid" style={{ marginBottom: '3rem' }}>
                {lockers.map((locker: any) => (
                    <div key={locker.id} className="glass-card" style={{
                        textAlign: 'center',
                        borderLeft: `5px solid ${locker.status === 'AVAILABLE' ? '#22c55e' : '#ef4444'}`
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{locker.lockerNumber}</div>
                        <div style={{
                            color: locker.status === 'AVAILABLE' ? '#22c55e' : '#ef4444',
                            fontWeight: 'bold',
                            fontSize: '0.875rem'
                        }}>
                            {locker.status}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Packages */}
            <h2 style={{ marginBottom: '1rem' }}>Recent Packages</h2>
            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '1rem' }}>Time</th>
                            <th style={{ padding: '1rem' }}>Locker</th>
                            <th style={{ padding: '1rem' }}>Resident</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Photo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {packages.map((pkg: any) => (
                            <tr key={pkg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem' }}>{new Date(pkg.createdAt).toLocaleString()}</td>
                                <td style={{ padding: '1rem' }}>{pkg.locker.lockerNumber}</td>
                                <td style={{ padding: '1rem' }}>{pkg.resident.name} ({pkg.resident.unitNumber})</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        background: pkg.status === 'PENDING' ? '#f59e0b' : '#22c55e',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {pkg.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {pkg.photoUrl ? (
                                        <a href={pkg.photoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View</a>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
