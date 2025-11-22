'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Tabs Components (will be extracted later if too large)
import OverviewTab from './tabs/OverviewTab'
import PackagesTab from './tabs/PackagesTab'
import ResidentsTab from './tabs/ResidentsTab'
import StaffTab from './tabs/StaffTab'

export default function Dashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/')
    }, [status, router])

    if (status === 'loading') return <div className="p-8 text-center">Loading...</div>

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'packages', label: 'Packages' },
        { id: 'residents', label: 'Residents' },
        { id: 'staff', label: 'Staff', adminOnly: true },
    ]

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1>Mailroom Dashboard</h1>
                <button className="btn btn-primary" onClick={() => router.push('/scan')}>
                    Scan New Package
                </button>
            </div>

            {/* Mobile-friendly Tab Navigation */}
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 border-b border-gray-200" style={{ scrollbarWidth: 'none' }}>
                {tabs.map(tab => {
                    if (tab.adminOnly && session?.user?.role !== 'ADMIN') return null
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white font-medium'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            style={{
                                background: activeTab === tab.id ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                                color: activeTab === tab.id ? 'white' : 'inherit',
                            }}
                        >
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'packages' && <PackagesTab />}
                {activeTab === 'residents' && <ResidentsTab />}
                {activeTab === 'staff' && session?.user?.role === 'ADMIN' && <StaffTab />}
            </div>
        </div>
    )
}
