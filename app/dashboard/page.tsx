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
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 pt-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Mailroom Dashboard</h1>
                <button className="btn btn-primary w-full md:w-auto shadow-xl shadow-blue-500/20 py-4 px-8 text-lg" onClick={() => router.push('/scan')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect width="10" height="10" x="7" y="7" rx="2" /></svg>
                    Scan New Package
                </button>
            </div>

            {/* Modern Tab Navigation */}
            <div className="tab-nav mb-12 overflow-x-auto p-2 gap-4 bg-gray-50/50 rounded-2xl border border-gray-100" style={{ scrollbarWidth: 'thin' }}>
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
