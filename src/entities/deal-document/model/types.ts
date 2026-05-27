export type DocumentType =
    | 'passport_buyer'
    | 'passport_seller'
    | 'title_document'
    | 'purchase_contract'
    | 'extract_egrn'
    | 'cadastral_passport'

export interface DealDocument {
    id: string
    dealId: string
    type: DocumentType
    name: string
    isRequired: boolean
    isProvided: boolean
    providedAt?: string
    comment?: string
}
