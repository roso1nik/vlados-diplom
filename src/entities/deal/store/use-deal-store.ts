import { DealDocument, DocumentType } from '@/entities/deal-document'
import { Property } from '@/entities/property'
import { User } from '@/entities/user'
import { create } from 'zustand'
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware'

import { Deal, DealStatus, HistoryEntry, STATUS_FLOW, STATUS_STEPS } from '../model'
import { DealStore } from './types'

const nowIso = () => new Date().toISOString()

const generateId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const noopStorage: StateStorage = {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined
}

const createHistoryEntry = (
    fromStatus: DealStatus,
    toStatus: DealStatus,
    changedBy: string,
    reason?: string
): HistoryEntry => ({
    id: generateId(),
    fromStatus,
    toStatus,
    changedAt: nowIso(),
    changedBy,
    reason
})

const hasRequiredDocuments = (dealId: string, documents: DealDocument[]) => {
    const dealDocuments = documents.filter((document) => document.dealId === dealId)
    return dealDocuments.every((document) => !document.isRequired || document.isProvided)
}

const DEFAULT_DOCUMENTS: Array<{ type: DocumentType; name: string; isRequired: boolean }> = [
    { type: 'passport_buyer', name: 'Паспорт покупателя', isRequired: true },
    { type: 'passport_seller', name: 'Паспорт продавца', isRequired: true },
    { type: 'title_document', name: 'Правоустанавливающий документ', isRequired: true },
    { type: 'purchase_contract', name: 'Договор купли-продажи', isRequired: true },
    { type: 'extract_egrn', name: 'Выписка из ЕГРН', isRequired: true },
    { type: 'cadastral_passport', name: 'Кадастровый паспорт', isRequired: false }
]

const buildDefaultDealDocuments = (dealId: string): DealDocument[] =>
    DEFAULT_DOCUMENTS.map((document) => ({
        id: generateId(),
        dealId,
        type: document.type,
        name: document.name,
        isRequired: document.isRequired,
        isProvided: false
    }))

const getPreviousStatus = (status: DealStatus): DealStatus | undefined => {
    const currentStepIndex = STATUS_STEPS.indexOf(status)
    if (currentStepIndex <= 0) {
        return undefined
    }

    return STATUS_STEPS[currentStepIndex - 1]
}

const getAutomaticDatePatch = (targetStatus: DealStatus): Partial<Deal> => {
    const currentDate = nowIso()

    if (targetStatus === 'negotiation') {
        return { negotiationStartDate: currentDate }
    }

    if (targetStatus === 'contract') {
        return { contractSigned: true, contractSignedAt: currentDate }
    }

    if (targetStatus === 'registration') {
        return { registrationStartedAt: currentDate }
    }

    if (targetStatus === 'completed') {
        return { completedAt: currentDate }
    }

    return {}
}

export const useDealStore = create<DealStore>()(
    persist(
        (set, get) => ({
            properties: [],
            users: [],
            deals: [],
            documents: [],

            addProperty: (property) => {
                const timestamp = nowIso()
                const newProperty: Property = {
                    ...property,
                    id: generateId(),
                    createdAt: timestamp,
                    updatedAt: timestamp
                }

                set((state) => ({ properties: [...state.properties, newProperty] }))
            },

            updateProperty: (id, data) => {
                set((state) => ({
                    properties: state.properties.map((property) =>
                        property.id === id ? { ...property, ...data, id: property.id, updatedAt: nowIso() } : property
                    )
                }))
            },

            deleteProperty: (id) => {
                set((state) => {
                    const dealIdsToRemove = state.deals.filter((deal) => deal.propertyId === id).map((deal) => deal.id)
                    return {
                        properties: state.properties.filter((property) => property.id !== id),
                        deals: state.deals.filter((deal) => deal.propertyId !== id),
                        documents: state.documents.filter((document) => !dealIdsToRemove.includes(document.dealId))
                    }
                })
            },

            addUser: (user) => {
                const timestamp = nowIso()
                const newUser: User = {
                    ...user,
                    id: generateId(),
                    createdAt: timestamp,
                    updatedAt: timestamp
                }

                set((state) => ({ users: [...state.users, newUser] }))
            },

            updateUser: (id, data) => {
                set((state) => ({
                    users: state.users.map((user) =>
                        user.id === id ? { ...user, ...data, id: user.id, updatedAt: nowIso() } : user
                    )
                }))
            },

            deleteUser: (id) => {
                set((state) => {
                    const dealIdsToRemove = state.deals
                        .filter((deal) => deal.buyerId === id || deal.sellerId === id)
                        .map((deal) => deal.id)

                    return {
                        users: state.users.filter((user) => user.id !== id),
                        deals: state.deals.filter((deal) => deal.buyerId !== id && deal.sellerId !== id),
                        documents: state.documents.filter((document) => !dealIdsToRemove.includes(document.dealId))
                    }
                })
            },

            addDeal: (dealInput) => {
                const timestamp = nowIso()
                const dealId = generateId()

                const newDeal: Deal = {
                    ...dealInput,
                    id: dealId,
                    status: 'draft',
                    history: [],
                    contractSigned: false,
                    createdAt: timestamp,
                    updatedAt: timestamp
                }

                const defaultDocuments = buildDefaultDealDocuments(dealId)

                set((state) => ({
                    deals: [...state.deals, newDeal],
                    documents: [...state.documents, ...defaultDocuments]
                }))
            },

            updateDeal: (id, data) => {
                set((state) => ({
                    deals: state.deals.map((deal) => {
                        if (deal.id !== id) {
                            return deal
                        }

                        const updatedDeal = { ...deal, ...data, id: deal.id, updatedAt: nowIso() }

                        if (updatedDeal.status === 'contract' && !updatedDeal.contractSignedAt) {
                            updatedDeal.contractSignedAt = nowIso()
                        }

                        return updatedDeal
                    })
                }))
            },

            deleteDeal: (id) => {
                set((state) => ({
                    deals: state.deals.filter((deal) => deal.id !== id),
                    documents: state.documents.filter((document) => document.dealId !== id)
                }))
            },

            canTransition: (deal, targetStatus) => {
                if (deal.status === targetStatus) {
                    return false
                }

                const allowedByFlow = STATUS_FLOW[deal.status].includes(targetStatus)
                if (!allowedByFlow) {
                    return false
                }

                if (targetStatus === 'registration') {
                    return deal.contractSigned
                }

                if (targetStatus === 'completed') {
                    const { documents } = get()
                    const requiredDocsReady = hasRequiredDocuments(deal.id, documents)
                    const hasRosreestrNumber = Boolean(deal.rosreestrNumber)
                    return requiredDocsReady && hasRosreestrNumber
                }

                return true
            },

            getAllowedNextStatuses: (deal) => {
                const { canTransition } = get()
                return STATUS_FLOW[deal.status].filter((status) => canTransition(deal, status))
            },

            nextStatus: (dealId, userId, comment) => {
                set((state) => {
                    const currentDeal = state.deals.find((deal) => deal.id === dealId)
                    if (!currentDeal) {
                        return state
                    }

                    const nextLinearStatus = STATUS_STEPS[STATUS_STEPS.indexOf(currentDeal.status) + 1]

                    if (!nextLinearStatus || !state.canTransition(currentDeal, nextLinearStatus)) {
                        return state
                    }

                    const automaticDatePatch = getAutomaticDatePatch(nextLinearStatus)
                    const nextHistory = [
                        ...currentDeal.history,
                        createHistoryEntry(currentDeal.status, nextLinearStatus, userId, comment)
                    ]

                    return {
                        deals: state.deals.map((deal) => {
                            if (deal.id !== dealId) {
                                return deal
                            }

                            return {
                                ...deal,
                                ...automaticDatePatch,
                                status: nextLinearStatus,
                                updatedAt: nowIso(),
                                finalAmount:
                                    nextLinearStatus === 'completed'
                                        ? (deal.finalAmount ?? deal.amount)
                                        : deal.finalAmount,
                                history: nextHistory
                            }
                        })
                    }
                })
            },

            prevStatus: (dealId, userId, comment) => {
                set((state) => {
                    const currentDeal = state.deals.find((deal) => deal.id === dealId)
                    if (!currentDeal || currentDeal.status === 'cancelled') {
                        return state
                    }

                    const previousStatus = getPreviousStatus(currentDeal.status)
                    if (!previousStatus) {
                        return state
                    }

                    const nextHistory = [
                        ...currentDeal.history,
                        createHistoryEntry(currentDeal.status, previousStatus, userId, comment)
                    ]

                    return {
                        deals: state.deals.map((deal) => {
                            if (deal.id !== dealId) {
                                return deal
                            }

                            return {
                                ...deal,
                                status: previousStatus,
                                contractSigned: previousStatus === 'contract' ? deal.contractSigned : false,
                                updatedAt: nowIso(),
                                history: nextHistory
                            }
                        })
                    }
                })
            },

            cancelDeal: (dealId, userId, reason) => {
                set((state) => ({
                    deals: state.deals.map((deal) => {
                        if (deal.id !== dealId || deal.status === 'completed' || deal.status === 'cancelled') {
                            return deal
                        }

                        return {
                            ...deal,
                            status: 'cancelled',
                            cancelReason: reason,
                            cancelAuthorId: userId,
                            cancelledAt: nowIso(),
                            updatedAt: nowIso(),
                            history: [...deal.history, createHistoryEntry(deal.status, 'cancelled', userId, reason)]
                        }
                    })
                }))
            },

            setDocumentProvided: (documentId, isProvided) => {
                set((state) => ({
                    documents: state.documents.map((document) => {
                        if (document.id !== documentId) {
                            return document
                        }

                        return {
                            ...document,
                            isProvided,
                            providedAt: isProvided ? nowIso() : undefined
                        }
                    })
                }))
            },

            getDealsByStatus: (status) => {
                return get().deals.filter((deal) => deal.status === status)
            },

            getActiveDeals: () => {
                return get().deals.filter((deal) => deal.status !== 'completed' && deal.status !== 'cancelled')
            },

            getDealProgress: (deal) => {
                if (deal.status === 'cancelled') {
                    return 0
                }

                const statusIndex = STATUS_STEPS.indexOf(deal.status)
                if (statusIndex < 0) {
                    return 0
                }

                return Math.round((statusIndex / (STATUS_STEPS.length - 1)) * 100)
            },

            getDealWithDetails: (dealId) => {
                const state = get()
                const deal = state.deals.find((currentDeal) => currentDeal.id === dealId)

                if (!deal) {
                    throw new Error(`Deal with id ${dealId} was not found`)
                }

                return {
                    deal,
                    property: state.properties.find((property) => property.id === deal.propertyId),
                    buyer: state.users.find((user) => user.id === deal.buyerId),
                    seller: state.users.find((user) => user.id === deal.sellerId),
                    documents: state.documents.filter((document) => document.dealId === deal.id)
                }
            },

            resetDemoData: () => {
                const timestamp = nowIso()

                const buyerId = generateId()
                const sellerId = generateId()
                const propertyId = generateId()
                const dealId = generateId()

                const buyer: User = {
                    id: buyerId,
                    firstName: 'Иван',
                    lastName: 'Иванов',
                    phone: '+79990000001',
                    email: 'buyer@example.com',
                    role: 'buyer',
                    passportSeries: '4510',
                    passportNumber: '123456',
                    passportIssuedBy: 'ОВД Пресненского района',
                    passportIssuedAt: '2018-10-10',
                    createdAt: timestamp,
                    updatedAt: timestamp
                }

                const seller: User = {
                    id: sellerId,
                    firstName: 'Петр',
                    lastName: 'Петров',
                    phone: '+79990000002',
                    email: 'seller@example.com',
                    role: 'seller',
                    passportSeries: '4509',
                    passportNumber: '654321',
                    passportIssuedBy: 'ОВД Тверского района',
                    passportIssuedAt: '2017-08-20',
                    createdAt: timestamp,
                    updatedAt: timestamp
                }

                const property: Property = {
                    id: propertyId,
                    address: 'Москва, ул. Тверская, д. 1',
                    type: 'apartment',
                    area: 52,
                    price: 15400000,
                    cadastralNumber: '77:01:0004012:3456',
                    rooms: 2,
                    floor: 5,
                    totalFloors: 12,
                    description: 'Квартира в центре',
                    createdAt: timestamp,
                    updatedAt: timestamp
                }

                const deal: Deal = {
                    id: dealId,
                    propertyId,
                    buyerId,
                    sellerId,
                    amount: 15000000,
                    depositAmount: 300000,
                    status: 'draft',
                    contractSigned: false,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                    history: []
                }

                set({
                    users: [buyer, seller],
                    properties: [property],
                    deals: [deal],
                    documents: buildDefaultDealDocuments(dealId)
                })
            }
        }),
        {
            name: 'deal-store-v1',
            storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : noopStorage)),
            partialize: (state) => ({
                properties: state.properties,
                users: state.users,
                deals: state.deals,
                documents: state.documents
            })
        }
    )
)
