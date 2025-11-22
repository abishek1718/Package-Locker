'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function PickupPage() {
    const { id } = useParams()
    const [pkg, setPkg] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (id) fetchPackage()
    }, [id])

    const fetchPackage = async () => {
        try {
            const res = await fetch(`/api/packages/${id}`)
            if (res.ok) {
                setPkg(await res.json())
            } else {
                setError('Package not found')
            }
        } catch (err) {
            setError('Error fetching package')
        } finally {
            setLoading(false)
        }
    }

    const handlePickup = async () => {
        // Removed confirm dialog for easier testing
        // if (!confirm('Are you sure you have picked up the package?')) return

        const res = await fetch(`/api/packages/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'PICKED_UP' })
        })

        if (res.ok) {
            fetchPackage() // Refresh
        } else {
            alert('Error updating status')
        }
    }

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading...</div>
    if (error) return <div className="container" style={{ padding: '2rem', color: 'red' }}>{error}</div>
    if (!pkg) return null

    return (
        <div className="container" style={{ padding: '2rem 1rem', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>Package Pickup</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Hello, {pkg.resident.name}</p>

                {pkg.status === 'PENDING' ? (
                    <>
                        <div style={{ marginBottom: '2rem' }}>
                            <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Your package is in Locker</p>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {pkg.locker.lockerNumber}
                            </div>
                        </div>

                        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>UNLOCK PIN CODE</p>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '0.25rem' }}>
                                {pkg.pin}
                            </div>
                        </div>

                        <button
                            onClick={handlePickup}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem' }}
                        >
                            I have picked up the package
                        </button>
                    </>
                ) : (
                    <div style={{ padding: '2rem 0' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                        <h2 style={{ marginBottom: '1rem' }}>Picked Up</h2>
                        <p style={{ color: '#666' }}>
                            This package was picked up on {new Date(pkg.pickedUpAt).toLocaleString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
