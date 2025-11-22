'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function ScanPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [residents, setResidents] = useState<any[]>([])
    const [lockers, setLockers] = useState<any[]>([])
    const [lockerInput, setLockerInput] = useState('')
    const [residentId, setResidentId] = useState('')
    const [scannedResult, setScannedResult] = useState('')
    const [generatedPin, setGeneratedPin] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [photo, setPhoto] = useState<File | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/')
        if (status === 'authenticated') {
            fetchResidents()
            fetchLockers()
        }
    }, [status, router])

    const fetchResidents = async () => {
        const res = await fetch('/api/residents')
        if (res.ok) setResidents(await res.json())
    }

    const fetchLockers = async () => {
        const res = await fetch('/api/lockers')
        if (res.ok) setLockers(await res.json())
    }

    useEffect(() => {
        // Initialize Scanner
        const scannerId = "reader"
        if (document.getElementById(scannerId)) {
            const scanner = new Html5QrcodeScanner(
                scannerId,
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            )

            scanner.render((decodedText) => {
                setScannedResult(decodedText)
                scanner.clear()
            }, (error) => {
                // console.warn(error)
            })

            return () => {
                scanner.clear().catch(console.error)
            }
        }
    }, [])

    // When scannedResult changes, update input
    useEffect(() => {
        if (scannedResult) {
            setLockerInput(scannedResult)
        }
    }, [scannedResult])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Resolve Locker ID
        const locker = lockers.find(l =>
            l.id === lockerInput ||
            l.lockerNumber === lockerInput ||
            l.qrIdentifier === lockerInput
        )

        if (!locker) {
            setError('Locker not found. Please check the ID or QR code.')
            setLoading(false)
            return
        }

        if (locker.status !== 'AVAILABLE') {
            setError(`Locker ${locker.lockerNumber} is currently ${locker.status}.`)
            setLoading(false)
            return
        }

        // Upload Photo if exists
        let photoUrl = null
        if (photo) {
            const formData = new FormData()
            formData.append('file', photo)
            try {
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })
                if (uploadRes.ok) {
                    const data = await uploadRes.json()
                    photoUrl = data.url
                }
            } catch (err) {
                console.error('Photo upload failed', err)
            }
        }

        const res = await fetch('/api/packages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lockerId: locker.id,
                residentId,
                photoUrl
            })
        })

        if (res.ok) {
            const pkg = await res.json()
            setGeneratedPin(pkg.pin)
        } else {
            const data = await res.json()
            setError(data.error || 'Error creating package')
        }
        setLoading(false)
    }

    if (generatedPin) {
        return (
            <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="glass-card">
                    <h1 style={{ color: '#22c55e', marginBottom: '1rem' }}>Package Stored!</h1>
                    <p>Please enter this PIN on the lock:</p>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', margin: '2rem 0', letterSpacing: '0.5rem' }}>
                        {generatedPin}
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setGeneratedPin('')
                            setLockerInput('')
                            setResidentId('')
                            setScannedResult('')
                            setError('')
                            setPhoto(null)
                        }}
                    >
                        Scan Next Package
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Scan Package</h1>

            <div className="glass-card">
                {!lockerInput && (
                    <div style={{ marginBottom: '2rem' }}>
                        <div id="reader" style={{ width: '100%' }}></div>
                        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>Scan Locker QR Code</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid">
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Locker ID / QR Code</label>
                        <input
                            className="input"
                            value={lockerInput}
                            onChange={(e) => setLockerInput(e.target.value)}
                            placeholder="Scan QR or enter Locker Number (e.g. 101)"
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Resident</label>
                        <select
                            className="input"
                            value={residentId}
                            onChange={(e) => setResidentId(e.target.value)}
                            required
                        >
                            <option value="">-- Select Resident --</option>
                            {residents.map(r => (
                                <option key={r.id} value={r.id}>{r.name} (Unit {r.unitNumber})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Package Photo (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="input"
                            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                        />
                    </div>

                    {error && (
                        <div style={{ color: '#ef4444', padding: '0.5rem', background: '#fee2e2', borderRadius: '0.5rem' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Processing...' : 'Store Package'}
                    </button>
                </form>
            </div>
        </div>
    )
}
