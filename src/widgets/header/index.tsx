'use client'

import { ThemeSwitcher } from '../theme'
import { FC } from 'react'

interface HeaderProps {
    isAdminView?: boolean
}

export const Header: FC<HeaderProps> = () => {
    return (
        <header className="border-border bg-sidebar/80 lg:py-auto sticky top-0 z-100 flex h-auto w-full flex-col items-center justify-between gap-3 border-b px-4 py-4 backdrop-blur-sm lg:h-20 lg:flex-row">
            <div className="flex w-full flex-row items-center justify-between gap-3 lg:justify-end">
                <div className="flex flex-row gap-1 lg:gap-3">
                    {/* <Link href={ROUTES.NOTIFICATIONS}>
                        <ActionIcon variant="transparent" size="xl" color="light">
                            <Bell size={20} />
                        </ActionIcon>
                    </Link> */}
                    {/* <LanguageSwitcher /> */}
                    <ThemeSwitcher />
                </div>
            </div>
        </header>
    )
}
