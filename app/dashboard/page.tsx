'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Tabs Components (will be extracted later if too large)
import OverviewTab from './tabs/OverviewTab'
import PackagesTab from './tabs/PackagesTab'
import RecipientsTab from './tabs/RecipientsTab'
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
        { id: 'recipients', label: 'Recipients' },
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

            {/* Modern Tab Navigation */}
            <div className="tab-nav mb-8 overflow-x-auto pb-1">
                {tabs.map(tab => {
                    if (tab.adminOnly && session?.user?.role !== 'ADMIN') return null
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px] space-y-8">
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'packages' && <PackagesTab />}
                {activeTab === 'recipients' && <RecipientsTab />}
                {activeTab === 'staff' && session?.user?.role === 'ADMIN' && <StaffTab />}
            </div>
        </div>
    )
}
