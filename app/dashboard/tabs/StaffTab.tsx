'use client'

import { useEffect, useState } from 'react'

export default function StaffTab() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Form State
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STAFF' })
    const [addingUser, setAddingUser] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/users')
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddingUser(true)
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            })
            if (res.ok) {
                alert('Staff member added successfully')
                setNewUser({ name: '', email: '', password: '', role: 'STAFF' })
                fetchUsers()
            } else {
                const data = await res.json()
                alert(data.error || 'Error adding user')
            }
        } catch (e) {
            console.error(e)
        }
        setAddingUser(false)
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this staff member?')) return

        try {
            const res = await fetch(`/api/users?id=${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchUsers()
            } else {
                const data = await res.json()
                alert(data.error || 'Error deleting user')
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="grid gap-8">
            {/* Add Staff Form */}
            <div className="glass-card p-4 md:p-6 max-w-2xl mx-auto w-full" style={{ marginTop: '1rem' }}>
                <h2 className="text-xl font-bold mb-6">Add New Staff Member</h2>
                <form onSubmit={handleAddUser} className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <input
                            className="input"
                            placeholder="Name"
                            value={newUser.name}
                            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            type="email"
                            placeholder="Email"
                            value={newUser.email}
                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <input
                            className="input"
                            type="password"
                            placeholder="Password"
                            value={newUser.password}
                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            required
                        />
                        <select
                            className="input"
                            value={newUser.role}
                            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="STAFF">Staff</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-full" disabled={addingUser}>
                        {addingUser ? 'Adding...' : 'Add Staff Member'}
                    </button>
                </form>
            </div>

            {/* Staff List */}
            <div>
                <h2 className="text-xl font-bold mb-4">Staff Directory</h2>

                {/* Mobile slide hint */}
                <div className="block md:hidden text-sm" style={{ color: 'var(--foreground)', opacity: 0.6, textAlign: 'center', padding: '0.5rem', marginBottom: '0.5rem' }}>
                    ← Slide to see more details →
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table style={{ display: 'block', width: '100%', minWidth: '900px', borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                                <tr style={{ background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left', color: 'var(--foreground)', opacity: 0.7, borderRight: '1px solid var(--border)', minWidth: '180px' }}>Name</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left', color: 'var(--foreground)', opacity: 0.7, borderRight: '1px solid var(--border)', minWidth: '220px' }}>Email</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left', color: 'var(--foreground)', opacity: 0.7, borderRight: '1px solid var(--border)', minWidth: '120px' }}>Role</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left', color: 'var(--foreground)', opacity: 0.7, borderRight: '1px solid var(--border)', minWidth: '150px' }}>Joined</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'left', color: 'var(--foreground)', opacity: 0.7, minWidth: '120px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                                {loading ? (
                                    <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
                                ) : users.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="hover:bg-gray-50">
                                        <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--foreground)', borderRight: '1px solid var(--border)' }}>{user.name}</td>
                                        <td style={{ padding: '1rem', color: 'var(--foreground)', opacity: 0.7, borderRight: '1px solid var(--border)' }}>{user.email}</td>
                                        <td style={{ padding: '1rem', borderRight: '1px solid var(--border)' }}>
                                            <span style={{
                                                padding: '0.375rem 0.625rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                background: user.role === 'ADMIN' ? '#f3e8ff' : '#dbeafe',
                                                color: user.role === 'ADMIN' ? '#6b21a8' : '#1e40af'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--foreground)', opacity: 0.6, borderRight: '1px solid var(--border)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                    color: 'white',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.5rem',
                                                    border: 'none',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)'
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)'
                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)'
                                                }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
