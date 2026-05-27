export type PropertyType = 'apartment' | 'house' | 'commercial' | 'land'

export interface Property {
    id: string
    address: string
    type: PropertyType
    area: number
    price: number
    cadastralNumber: string
    rooms?: number
    floor?: number
    totalFloors?: number
    description?: string
    createdAt: string
    updatedAt: string
}
