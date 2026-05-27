import { DealStatus } from './types'

export const DEAL_STATUSES: DealStatus[] = [
    'draft',
    'negotiation',
    'contract',
    'registration',
    'completed',
    'cancelled'
]

export const STATUS_FLOW: Record<DealStatus, DealStatus[]> = {
    draft: ['negotiation', 'cancelled'],
    negotiation: ['contract', 'cancelled'],
    contract: ['registration', 'cancelled'],
    registration: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
}

export const STATUS_NAMES: Record<DealStatus, string> = {
    draft: 'Черновик',
    negotiation: 'Переговоры',
    contract: 'Договор подписан',
    registration: 'На регистрации',
    completed: 'Завершена',
    cancelled: 'Отменена'
}

export const STATUS_STEPS: DealStatus[] = ['draft', 'negotiation', 'contract', 'registration', 'completed']
