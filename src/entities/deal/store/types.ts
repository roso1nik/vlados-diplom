import { DealDocument } from '@/entities/deal-document'
import { Property } from '@/entities/property'
import { User } from '@/entities/user'

import { Deal, DealStatus } from '../model'

export interface DealWithDetails {
    deal: Deal
    property: Property | undefined
    buyer: User | undefined
    seller: User | undefined
    documents: DealDocument[]
}

export interface DealStore {
    properties: Property[]
    users: User[]
    deals: Deal[]
    documents: DealDocument[]

    addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => void
    updateProperty: (id: string, data: Partial<Property>) => void
    deleteProperty: (id: string) => void

    addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void
    updateUser: (id: string, data: Partial<User>) => void
    deleteUser: (id: string) => void

    addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'history' | 'contractSigned'>) => void
    updateDeal: (id: string, data: Partial<Deal>) => void
    deleteDeal: (id: string) => void

    nextStatus: (dealId: string, userId: string, comment?: string) => void
    prevStatus: (dealId: string, userId: string, comment?: string) => void
    cancelDeal: (dealId: string, userId: string, reason: string) => void
    canTransition: (deal: Deal, targetStatus: DealStatus) => boolean
    getAllowedNextStatuses: (deal: Deal) => DealStatus[]

    setDocumentProvided: (documentId: string, isProvided: boolean) => void

    getDealsByStatus: (status: DealStatus) => Deal[]
    getActiveDeals: () => Deal[]
    getDealProgress: (deal: Deal) => number
    getDealWithDetails: (dealId: string) => DealWithDetails

    resetDemoData: () => void
}
