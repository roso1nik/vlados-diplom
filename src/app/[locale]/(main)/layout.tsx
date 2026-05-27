'use client'

import { Header } from '@/widgets/header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full flex-row gap-0">
            <div className="bg-background flex w-full flex-col gap-3">
                <Header />
                <main className="p-8">{children}</main>
            </div>
        </div>
    )
}
