export type UserRole = 'buyer' | 'seller' | 'both'

export interface User {
    id: string
    firstName: string
    lastName: string
    middleName?: string
    phone: string
    email: string
    role: UserRole
    passportSeries: string
    passportNumber: string
    passportIssuedBy: string
    passportIssuedAt: string
    inn?: string
    createdAt: string
    updatedAt: string
}
