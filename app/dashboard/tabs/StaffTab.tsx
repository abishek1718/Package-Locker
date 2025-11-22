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
            <div className="glass-card p-6 max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Add New Staff Member</h2>
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
                    <button type="submit" className="btn btn-primary" disabled={addingUser}>
                        {addingUser ? 'Adding...' : 'Add Staff Member'}
                    </button>
                </form>
            </div>

            {/* Staff List */}
            <div>
                <h2 className="text-xl font-bold mb-4">Staff Directory</h2>
                <div className="glass-card overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-left border-b border-gray-200">
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
                            ) : users.map(user => (
                                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-4 font-bold">{user.name}</td>
                                    <td className="p-4 text-gray-600">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
