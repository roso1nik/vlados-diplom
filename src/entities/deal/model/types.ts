export type DealStatus = 'draft' | 'negotiation' | 'contract' | 'registration' | 'completed' | 'cancelled'

export interface HistoryEntry {
    id: string
    fromStatus: DealStatus
    toStatus: DealStatus
    changedAt: string
    reason?: string
    changedBy: string
}

export interface Deal {
    id: string
    propertyId: string
    buyerId: string
    sellerId: string
    amount: number
    depositAmount?: number
    finalAmount?: number
    status: DealStatus
    contractSigned: boolean
    createdAt: string
    updatedAt: string
    negotiationStartDate?: string
    contractSignedAt?: string
    registrationStartedAt?: string
    completedAt?: string
    cancelledAt?: string
    rosreestrNumber?: string
    cancelReason?: string
    cancelAuthorId?: string
    history: HistoryEntry[]
}
