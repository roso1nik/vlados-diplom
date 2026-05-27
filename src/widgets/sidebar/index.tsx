'use client'

import { LanguageSwitcher } from '@/widgets/language-switcher'
import { Logo } from '@/widgets/logo'
import { LayoutDashboard, Building2, Users, Handshake, FileText, RotateCcw } from 'lucide-react'
import { Button, Badge, Divider, ScrollArea } from '@mantine/core'
import { useDealStore } from '@/entities/deal/store/use-deal-store'
import { useTranslations } from 'next-intl'

export const Sidebar = () => {
    const t = useTranslations()
    const { properties, users, deals, documents, resetDemoData } = useDealStore()

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <div className="sticky top-0 flex h-screen flex-col">
            <div className="flex flex-col gap-3 lg:flex-1">
                <Logo />
                <ScrollArea className="flex-1">
                    <div className="flex flex-1 flex-col gap-2 p-2">
                        <Button
                            variant="light"
                            justify="space-between"
                            leftSection={<LayoutDashboard size={18} />}
                            onClick={() => scrollToSection('dashboard-top')}
                        >
                            {t('main-page')}
                        </Button>
                        <Divider my="xs" />
                        <Button
                            variant="subtle"
                            justify="space-between"
                            leftSection={<Building2 size={18} />}
                            onClick={() => scrollToSection('property-section')}
                        >
                            Property
                            <Badge variant="light">{properties.length}</Badge>
                        </Button>
                        <Button
                            variant="subtle"
                            justify="space-between"
                            leftSection={<Users size={18} />}
                            onClick={() => scrollToSection('users-section')}
                        >
                            Users
                            <Badge variant="light">{users.length}</Badge>
                        </Button>
                        <Button
                            variant="subtle"
                            justify="space-between"
                            leftSection={<Handshake size={18} />}
                            onClick={() => scrollToSection('deals-section')}
                        >
                            Deals
                            <Badge variant="light">{deals.length}</Badge>
                        </Button>
                        <Button
                            variant="subtle"
                            justify="space-between"
                            leftSection={<FileText size={18} />}
                            onClick={() => scrollToSection('documents-section')}
                        >
                            Documents
                            <Badge variant="light">{documents.length}</Badge>
                        </Button>
                    </div>
                </ScrollArea>
            </div>
            <div className="flex flex-col gap-2 p-4">
                <Button leftSection={<RotateCcw size={16} />} variant="light" onClick={() => resetDemoData()}>
                    Seed demo
                </Button>
                <LanguageSwitcher />
            </div>
        </div>
    )
}
