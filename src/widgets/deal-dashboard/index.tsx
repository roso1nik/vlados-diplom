/* eslint-disable react-perf/jsx-no-new-function-as-prop */
'use client'

import { DEAL_STATUSES, STATUS_NAMES, type DealStatus } from '@/entities/deal'
import { useDealStore } from '@/entities/deal/store/use-deal-store'
import {
    Badge,
    Button,
    Card,
    Divider,
    Group,
    Modal,
    NumberInput,
    ScrollArea,
    Select,
    SimpleGrid,
    Stack,
    Table,
    Tabs,
    Text,
    Textarea,
    TextInput,
    Title,
    ActionIcon,
    Switch
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
    Building2,
    Check,
    ChevronsRight,
    FileText,
    Handshake,
    Pencil,
    Plus,
    RotateCcw,
    Trash2,
    Users
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

type PropertyForm = {
    address: string
    type: 'apartment' | 'house' | 'commercial' | 'land'
    area: number
    price: number
    cadastralNumber: string
    rooms: number | ''
    floor: number | ''
    totalFloors: number | ''
    description: string
}

type UserForm = {
    firstName: string
    lastName: string
    middleName: string
    phone: string
    email: string
    role: 'buyer' | 'seller' | 'both'
    passportSeries: string
    passportNumber: string
    passportIssuedBy: string
    passportIssuedAt: string
    inn: string
}

type DealForm = {
    propertyId: string
    buyerId: string
    sellerId: string
    amount: number
    depositAmount: number | ''
    finalAmount: number | ''
    rosreestrNumber: string
}

const emptyPropertyForm: PropertyForm = {
    address: '',
    type: 'apartment',
    area: 0,
    price: 0,
    cadastralNumber: '',
    rooms: '',
    floor: '',
    totalFloors: '',
    description: ''
}

const emptyUserForm: UserForm = {
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    email: '',
    role: 'buyer',
    passportSeries: '',
    passportNumber: '',
    passportIssuedBy: '',
    passportIssuedAt: '',
    inn: ''
}

const emptyDealForm: DealForm = {
    propertyId: '',
    buyerId: '',
    sellerId: '',
    amount: 0,
    depositAmount: '',
    finalAmount: '',
    rosreestrNumber: ''
}

const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })
const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })

const formatMoney = (value?: number) => (typeof value === 'number' ? money.format(value) : '—')
const formatDate = (value?: string) => (value ? dateFormat.format(new Date(value)) : '—')
const labelForStatus = (status: DealStatus) => STATUS_NAMES[status]

export const DealDashboard = () => {
    const {
        properties,
        users,
        updateProperty,
        addProperty,
        updateUser,
        addUser,
        documents,
        deleteProperty,
        deleteUser,
        setDocumentProvided
    } = useDealStore()

    const deals = useDealStore((state) => state.deals)
    const {
        addDeal,
        updateDeal,
        deleteDeal,
        nextStatus,
        prevStatus,
        cancelDeal,
        getAllowedNextStatuses,
        getActiveDeals,
        getDealProgress,
        getDealWithDetails,
        resetDemoData
    } = useDealStore()

    const [propertyForm, setPropertyForm] = useState<PropertyForm>(emptyPropertyForm)
    const [userForm, setUserForm] = useState<UserForm>(emptyUserForm)
    const [dealForm, setDealForm] = useState<DealForm>(emptyDealForm)
    const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null)
    const [editingUserId, setEditingUserId] = useState<string | null>(null)
    const [editingDealId, setEditingDealId] = useState<string | null>(null)
    const [cancelDealId, setCancelDealId] = useState<string | null>(null)
    const [cancelReason, setCancelReason] = useState('')

    const [propertyEditOpened, propertyEditHandlers] = useDisclosure(false)
    const [userEditOpened, userEditHandlers] = useDisclosure(false)
    const [dealEditOpened, dealEditHandlers] = useDisclosure(false)
    const [cancelOpened, cancelHandlers] = useDisclosure(false)

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (!window.localStorage.getItem('deal-store-v1') && !properties.length && !users.length && !deals.length) {
            resetDemoData()
        }
    }, [resetDemoData, deals.length, properties.length, users.length])

    const dealDetails = useMemo(() => deals.map((deal) => getDealWithDetails(deal.id)), [deals, getDealWithDetails])

    const propertySelectData = properties.map((property) => ({
        value: property.id,
        label: `${property.address} · ${property.area} м²`
    }))
    const userSelectData = users.map((user) => ({ value: user.id, label: `${user.lastName} ${user.firstName}` }))

    const openPropertyEdit = (propertyId: string) => {
        const property = properties.find((item) => item.id === propertyId)
        if (!property) return

        setEditingPropertyId(propertyId)
        setPropertyForm({
            address: property.address,
            type: property.type,
            area: property.area,
            price: property.price,
            cadastralNumber: property.cadastralNumber,
            rooms: property.rooms ?? '',
            floor: property.floor ?? '',
            totalFloors: property.totalFloors ?? '',
            description: property.description ?? ''
        })
        propertyEditHandlers.open()
    }

    const openUserEdit = (userId: string) => {
        const user = users.find((item) => item.id === userId)
        if (!user) return

        setEditingUserId(userId)
        setUserForm({
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName ?? '',
            phone: user.phone,
            email: user.email,
            role: user.role,
            passportSeries: user.passportSeries,
            passportNumber: user.passportNumber,
            passportIssuedBy: user.passportIssuedBy,
            passportIssuedAt: user.passportIssuedAt,
            inn: user.inn ?? ''
        })
        userEditHandlers.open()
    }

    const openDealEdit = (dealId: string) => {
        const deal = deals.find((item) => item.id === dealId)
        if (!deal) return

        setEditingDealId(dealId)
        setDealForm({
            propertyId: deal.propertyId,
            buyerId: deal.buyerId,
            sellerId: deal.sellerId,
            amount: deal.amount,
            depositAmount: deal.depositAmount ?? '',
            finalAmount: deal.finalAmount ?? '',
            rosreestrNumber: deal.rosreestrNumber ?? ''
        })
        dealEditHandlers.open()
    }

    const handlePropertySubmit = () => {
        if (!propertyForm.address || !propertyForm.cadastralNumber) {
            toast.error('Заполни адрес и кадастровый номер')
            return
        }

        const payload = {
            ...propertyForm,
            rooms: propertyForm.rooms === '' ? undefined : Number(propertyForm.rooms),
            floor: propertyForm.floor === '' ? undefined : Number(propertyForm.floor),
            totalFloors: propertyForm.totalFloors === '' ? undefined : Number(propertyForm.totalFloors)
        }

        if (editingPropertyId) {
            updateProperty(editingPropertyId, payload)
            toast.success('Недвижимость обновлена')
            propertyEditHandlers.close()
            setEditingPropertyId(null)
        } else {
            addProperty(payload)
            toast.success('Недвижимость добавлена')
        }

        setPropertyForm(emptyPropertyForm)
    }

    const handleUserSubmit = () => {
        if (!userForm.firstName || !userForm.lastName || !userForm.phone || !userForm.email) {
            toast.error('Заполни имя, фамилию, телефон и email')
            return
        }

        const payload = {
            ...userForm,
            middleName: userForm.middleName || undefined,
            inn: userForm.inn || undefined
        }

        if (editingUserId) {
            updateUser(editingUserId, payload)
            toast.success('Пользователь обновлен')
            userEditHandlers.close()
            setEditingUserId(null)
        } else {
            addUser(payload)
            toast.success('Пользователь добавлен')
        }

        setUserForm(emptyUserForm)
    }

    const handleDealSubmit = () => {
        if (!dealForm.propertyId || !dealForm.buyerId || !dealForm.sellerId) {
            toast.error('Выбери недвижимость, покупателя и продавца')
            return
        }

        const payload = {
            propertyId: dealForm.propertyId,
            buyerId: dealForm.buyerId,
            sellerId: dealForm.sellerId,
            amount: dealForm.amount,
            depositAmount: dealForm.depositAmount === '' ? undefined : Number(dealForm.depositAmount),
            finalAmount: dealForm.finalAmount === '' ? undefined : Number(dealForm.finalAmount),
            rosreestrNumber: dealForm.rosreestrNumber || undefined
        }

        if (editingDealId) {
            updateDeal(editingDealId, payload)
            toast.success('Сделка обновлена')
            dealEditHandlers.close()
            setEditingDealId(null)
        } else {
            addDeal(payload)
            toast.success('Сделка добавлена')
        }

        setDealForm(emptyDealForm)
    }

    const requestCancelDeal = (dealId: string) => {
        setCancelDealId(dealId)
        setCancelReason('')
        cancelHandlers.open()
    }

    const confirmCancelDeal = () => {
        if (!cancelDealId) return
        if (!cancelReason.trim()) {
            toast.error('Укажи причину отмены')
            return
        }

        cancelDeal(cancelDealId, 'system', cancelReason)
        toast.success('Сделка отменена')
        cancelHandlers.close()
        setCancelDealId(null)
    }

    const renderDealActions = (dealId: string) => {
        const currentDeal = deals.find((item) => item.id === dealId)
        if (!currentDeal) return null

        const allowedStatuses = getAllowedNextStatuses(currentDeal)

        return (
            <Group gap="xs" wrap="wrap">
                <Button
                    size="xs"
                    variant="light"
                    leftSection={<Pencil size={14} />}
                    onClick={() => openDealEdit(dealId)}
                >
                    Редактировать
                </Button>
                {allowedStatuses.map((status) =>
                    status === 'cancelled' ? (
                        <Button
                            key={status}
                            size="xs"
                            color="red"
                            variant="light"
                            leftSection={<Trash2 size={14} />}
                            onClick={() => requestCancelDeal(dealId)}
                        >
                            Отменить
                        </Button>
                    ) : (
                        <Button
                            key={status}
                            size="xs"
                            leftSection={<ChevronsRight size={14} />}
                            onClick={() => nextStatus(dealId, 'system', `Переход в статус: ${labelForStatus(status)}`)}
                        >
                            {labelForStatus(status)}
                        </Button>
                    )
                )}
                <Button
                    size="xs"
                    variant="outline"
                    leftSection={<RotateCcw size={14} />}
                    onClick={() => prevStatus(dealId, 'system', 'Откат статуса')}
                >
                    Назад
                </Button>
                <Button
                    size="xs"
                    color="red"
                    variant="subtle"
                    leftSection={<Trash2 size={14} />}
                    onClick={() => {
                        if (window.confirm('Удалить сделку?')) {
                            deleteDeal(dealId)
                            toast.success('Сделка удалена')
                        }
                    }}
                >
                    Удалить
                </Button>
            </Group>
        )
    }

    return (
        <Stack gap="xl" id="dashboard-top">
            <Card radius="xl" withBorder className="overflow-hidden">
                <Group justify="space-between" align="flex-start" wrap="wrap">
                    <Stack gap={6}>
                        <Badge variant="light" leftSection={<Handshake size={14} />}>
                            Управление сделками по недвижимости
                        </Badge>
                        <Title order={2}>Сущности, статусы и документы</Title>
                    </Stack>
                    <Button leftSection={<RotateCcw size={16} />} variant="light" onClick={() => resetDemoData()}>
                        Загрузить демо
                    </Button>
                </Group>
                <Divider my="lg" />
                <SimpleGrid cols={{ base: 1, sm: 2, xl: 5 }}>
                    <Card withBorder radius="lg">
                        <Text size="sm" c="dimmed">
                            Недвижимость
                        </Text>
                        <Text fw={700} fz={28}>
                            {properties.length}
                        </Text>
                    </Card>
                    <Card withBorder radius="lg">
                        <Text size="sm" c="dimmed">
                            Пользователи
                        </Text>
                        <Text fw={700} fz={28}>
                            {users.length}
                        </Text>
                    </Card>
                    <Card withBorder radius="lg">
                        <Text size="sm" c="dimmed">
                            Сделки
                        </Text>
                        <Text fw={700} fz={28}>
                            {deals.length}
                        </Text>
                    </Card>
                    <Card withBorder radius="lg">
                        <Text size="sm" c="dimmed">
                            Документы
                        </Text>
                        <Text fw={700} fz={28}>
                            {documents.filter((document) => document.isProvided).length}/{documents.length}
                        </Text>
                    </Card>
                    <Card withBorder radius="lg">
                        <Text size="sm" c="dimmed">
                            Активные сделки
                        </Text>
                        <Text fw={700} fz={28}>
                            {getActiveDeals().length}
                        </Text>
                    </Card>
                </SimpleGrid>
            </Card>

            <Tabs defaultValue="property" variant="pills" radius="xl">
                <Tabs.List>
                    <Tabs.Tab value="property" leftSection={<Building2 size={16} />}>
                        Недвижимость
                    </Tabs.Tab>
                    <Tabs.Tab value="users" leftSection={<Users size={16} />}>
                        Пользователи
                    </Tabs.Tab>
                    <Tabs.Tab value="deals" leftSection={<Handshake size={16} />}>
                        Сделки
                    </Tabs.Tab>
                    <Tabs.Tab value="documents" leftSection={<FileText size={16} />}>
                        Документы
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="property" pt="lg">
                    <Stack gap="lg" id="property-section">
                        <Card withBorder radius="xl">
                            <Group justify="space-between" align="flex-start" wrap="wrap">
                                <div>
                                    <Title order={3}>Недвижимость</Title>
                                </div>
                                {editingPropertyId ? (
                                    <Badge variant="light">Редактирование</Badge>
                                ) : (
                                    <Badge variant="light">Создание</Badge>
                                )}
                            </Group>
                            <SimpleGrid cols={{ base: 1, md: 2 }} mt="md">
                                <TextInput
                                    label="Адрес"
                                    value={propertyForm.address}
                                    onChange={(event) =>
                                        setPropertyForm((prev) => ({ ...prev, address: event.target.value }))
                                    }
                                />
                                <Select
                                    label="Тип"
                                    data={[
                                        { value: 'apartment', label: 'Apartment' },
                                        { value: 'house', label: 'House' },
                                        { value: 'commercial', label: 'Commercial' },
                                        { value: 'land', label: 'Land' }
                                    ]}
                                    value={propertyForm.type}
                                    onChange={(value) =>
                                        setPropertyForm((prev) => ({
                                            ...prev,
                                            type: (value as PropertyForm['type']) ?? 'apartment'
                                        }))
                                    }
                                />
                                <NumberInput
                                    label="Площадь"
                                    value={propertyForm.area}
                                    onChange={(value) =>
                                        setPropertyForm((prev) => ({ ...prev, area: Number(value) || 0 }))
                                    }
                                />
                                <NumberInput
                                    label="Цена"
                                    value={propertyForm.price}
                                    onChange={(value) =>
                                        setPropertyForm((prev) => ({ ...prev, price: Number(value) || 0 }))
                                    }
                                />
                                <TextInput
                                    label="Кадастровый номер"
                                    value={propertyForm.cadastralNumber}
                                    onChange={(event) =>
                                        setPropertyForm((prev) => ({
                                            ...prev,
                                            cadastralNumber: event.target.value
                                        }))
                                    }
                                />
                                <TextInput
                                    label="Описание"
                                    value={propertyForm.description}
                                    onChange={(event) =>
                                        setPropertyForm((prev) => ({ ...prev, description: event.target.value }))
                                    }
                                />
                                <NumberInput
                                    label="Комнаты"
                                    value={propertyForm.rooms}
                                    onChange={(value) =>
                                        setPropertyForm((prev) => ({
                                            ...prev,
                                            rooms: value === '' ? '' : Number(value) || 0
                                        }))
                                    }
                                />
                                <NumberInput
                                    label="Этаж"
                                    value={propertyForm.floor}
                                    onChange={(value) =>
                                        setPropertyForm((prev) => ({
                                            ...prev,
                                            floor: value === '' ? '' : Number(value) || 0
                                        }))
                                    }
                                />
                                <NumberInput
                                    label="Этажность"
                                    value={propertyForm.totalFloors}
                                    onChange={(value) =>
                                        setPropertyForm((prev) => ({
                                            ...prev,
                                            totalFloors: value === '' ? '' : Number(value) || 0
                                        }))
                                    }
                                />
                            </SimpleGrid>
                            <Group mt="md">
                                <Button leftSection={<Plus size={16} />} onClick={handlePropertySubmit}>
                                    {editingPropertyId ? 'Сохранить' : 'Добавить'}
                                </Button>
                                {editingPropertyId && (
                                    <Button
                                        variant="default"
                                        onClick={() => {
                                            setEditingPropertyId(null)
                                            setPropertyForm(emptyPropertyForm)
                                            propertyEditHandlers.close()
                                        }}
                                    >
                                        Сбросить
                                    </Button>
                                )}
                            </Group>
                        </Card>

                        <Card withBorder radius="xl">
                            <ScrollArea>
                                <Table striped highlightOnHover withColumnBorders>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Адрес</Table.Th>
                                            <Table.Th>Тип</Table.Th>
                                            <Table.Th>Площадь</Table.Th>
                                            <Table.Th>Цена</Table.Th>
                                            <Table.Th>Кадастр</Table.Th>
                                            <Table.Th>Действия</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {properties.map((property) => (
                                            <Table.Tr key={property.id}>
                                                <Table.Td>{property.address}</Table.Td>
                                                <Table.Td>{property.type}</Table.Td>
                                                <Table.Td>{property.area} м²</Table.Td>
                                                <Table.Td>{formatMoney(property.price)}</Table.Td>
                                                <Table.Td>{property.cadastralNumber}</Table.Td>
                                                <Table.Td>
                                                    <Group gap="xs">
                                                        <ActionIcon
                                                            variant="light"
                                                            onClick={() => openPropertyEdit(property.id)}
                                                        >
                                                            <Pencil size={14} />
                                                        </ActionIcon>
                                                        <ActionIcon
                                                            color="red"
                                                            variant="light"
                                                            onClick={() => {
                                                                if (window.confirm('Удалить недвижимость?')) {
                                                                    deleteProperty(property.id)
                                                                    toast.success('Недвижимость удалена')
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </ActionIcon>
                                                    </Group>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </ScrollArea>
                        </Card>
                    </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="users" pt="lg">
                    <Stack gap="lg" id="users-section">
                        <Card withBorder radius="xl">
                            <Group justify="space-between" align="flex-start" wrap="wrap">
                                <div>
                                    <Title order={3}>Пользователи</Title>
                                </div>
                                {editingUserId ? (
                                    <Badge variant="light">Редактирование</Badge>
                                ) : (
                                    <Badge variant="light">Создание</Badge>
                                )}
                            </Group>
                            <SimpleGrid cols={{ base: 1, md: 2 }} mt="md">
                                <TextInput
                                    label="Имя"
                                    value={userForm.firstName}
                                    onChange={(event) =>
                                        setUserForm((prev) => ({ ...prev, firstName: event.target.value }))
                                    }
                                />
                                <TextInput
                                    label="Фамилия"
                                    value={userForm.lastName}
                                    onChange={(event) =>
                                        setUserForm((prev) => ({ ...prev, lastName: event.target.value }))
                                    }
                                />
                                <TextInput
                                    label="Отчество"
                                    value={userForm.middleName}
                                    onChange={(event) =>
                                        setUserForm((prev) => ({ ...prev, middleName: event.target.value }))
                                    }
                                />
                                <Select
                                    label="Роль"
                                    data={[
                                        { value: 'buyer', label: 'Buyer' },
                                        { value: 'seller', label: 'Seller' },
                                        { value: 'both', label: 'Both' }
                                    ]}
                                    value={userForm.role}
                                    onChange={(value) =>
                                        setUserForm((prev) => ({
                                            ...prev,
                                            role: (value as UserForm['role']) ?? 'buyer'
                                        }))
                                    }
                                />
                                <TextInput
                                    label="Телефон"
                                    value={userForm.phone}
                                    onChange={(event) =>
                                        setUserForm((prev) => ({ ...prev, phone: event.target.value }))
                                    }
                                />
                                <TextInput
                                    label="Email"
                                    value={userForm.email}
                                    onChange={(event) =>
                                        setUserForm((prev) => ({ ...prev, email: event.target.value }))
                                    }
                                />
                                <TextInput
                                    label="Серия паспорта"
                                    value={userForm.passportSeries}
                                    onChange={(event) =>
                                        setUserForm((prev) => ({ ...prev, passportSeries: event.target.value }))
                                    }
                                />
                                <TextInput
                                    label="Номер паспорта"
                                    value={userForm.passportNumber}
                                    onChange={(event) =>
                                        setUserForm((prev) => ({ ...prev, passportNumber: event.target.value }))
                                    }
                                />
                                <TextInput
                                    label="Кем выдан"
                                    value={userForm.passportIssuedBy}
                                    onChange={(event) =>
                                        setUserForm((prev) => ({
                                            ...prev,
                                            passportIssuedBy: event.target.value
                                        }))
                                    }
                                />
                                <TextInput
                                    label="Дата выдачи"
                                    value={userForm.passportIssuedAt}
                                    onChange={(event) =>
                                        setUserForm((prev) => ({
                                            ...prev,
                                            passportIssuedAt: event.target.value
                                        }))
                                    }
                                />
                                <TextInput
                                    label="ИНН"
                                    value={userForm.inn}
                                    onChange={(event) => setUserForm((prev) => ({ ...prev, inn: event.target.value }))}
                                />
                            </SimpleGrid>
                            <Group mt="md">
                                <Button leftSection={<Plus size={16} />} onClick={handleUserSubmit}>
                                    {editingUserId ? 'Сохранить' : 'Добавить'}
                                </Button>
                                {editingUserId && (
                                    <Button
                                        variant="default"
                                        onClick={() => {
                                            setEditingUserId(null)
                                            setUserForm(emptyUserForm)
                                            userEditHandlers.close()
                                        }}
                                    >
                                        Сбросить
                                    </Button>
                                )}
                            </Group>
                        </Card>

                        <Card withBorder radius="xl">
                            <ScrollArea>
                                <Table striped highlightOnHover withColumnBorders>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>ФИО</Table.Th>
                                            <Table.Th>Роль</Table.Th>
                                            <Table.Th>Телефон</Table.Th>
                                            <Table.Th>Email</Table.Th>
                                            <Table.Th>Паспорт</Table.Th>
                                            <Table.Th>Действия</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {users.map((user) => (
                                            <Table.Tr key={user.id}>
                                                <Table.Td>{`${user.lastName} ${user.firstName} ${user.middleName ?? ''}`}</Table.Td>
                                                <Table.Td>{user.role}</Table.Td>
                                                <Table.Td>{user.phone}</Table.Td>
                                                <Table.Td>{user.email}</Table.Td>
                                                <Table.Td>{`${user.passportSeries} ${user.passportNumber}`}</Table.Td>
                                                <Table.Td>
                                                    <Group gap="xs">
                                                        <ActionIcon
                                                            variant="light"
                                                            onClick={() => openUserEdit(user.id)}
                                                        >
                                                            <Pencil size={14} />
                                                        </ActionIcon>
                                                        <ActionIcon
                                                            color="red"
                                                            variant="light"
                                                            onClick={() => {
                                                                if (window.confirm('Удалить пользователя?')) {
                                                                    deleteUser(user.id)
                                                                    toast.success('Пользователь удален')
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </ActionIcon>
                                                    </Group>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </ScrollArea>
                        </Card>
                    </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="deals" pt="lg">
                    <Stack gap="lg" id="deals-section">
                        <Card withBorder radius="xl">
                            <Group justify="space-between" align="flex-start" wrap="wrap">
                                <div>
                                    <Title order={3}>Сделки</Title>
                                </div>
                                {editingDealId ? (
                                    <Badge variant="light">Редактирование</Badge>
                                ) : (
                                    <Badge variant="light">Создание</Badge>
                                )}
                            </Group>
                            <SimpleGrid cols={{ base: 1, md: 2 }} mt="md">
                                <Select
                                    label="Недвижимость"
                                    data={propertySelectData}
                                    value={dealForm.propertyId}
                                    onChange={(value) => setDealForm((prev) => ({ ...prev, propertyId: value ?? '' }))}
                                    searchable
                                />
                                <Select
                                    label="Покупатель"
                                    data={userSelectData}
                                    value={dealForm.buyerId}
                                    onChange={(value) => setDealForm((prev) => ({ ...prev, buyerId: value ?? '' }))}
                                    searchable
                                />
                                <Select
                                    label="Продавец"
                                    data={userSelectData}
                                    value={dealForm.sellerId}
                                    onChange={(value) => setDealForm((prev) => ({ ...prev, sellerId: value ?? '' }))}
                                    searchable
                                />
                                <NumberInput
                                    label="Сумма"
                                    value={dealForm.amount}
                                    onChange={(value) =>
                                        setDealForm((prev) => ({ ...prev, amount: Number(value) || 0 }))
                                    }
                                />
                                <NumberInput
                                    label="Задаток"
                                    value={dealForm.depositAmount}
                                    onChange={(value) =>
                                        setDealForm((prev) => ({
                                            ...prev,
                                            depositAmount: value === '' ? '' : Number(value) || 0
                                        }))
                                    }
                                />
                                <NumberInput
                                    label="Финальная сумма"
                                    value={dealForm.finalAmount}
                                    onChange={(value) =>
                                        setDealForm((prev) => ({
                                            ...prev,
                                            finalAmount: value === '' ? '' : Number(value) || 0
                                        }))
                                    }
                                />
                                <TextInput
                                    label="Номер Росреестра"
                                    value={dealForm.rosreestrNumber}
                                    onChange={(event) =>
                                        setDealForm((prev) => ({ ...prev, rosreestrNumber: event.target.value }))
                                    }
                                />
                            </SimpleGrid>
                            <Group mt="md">
                                <Button leftSection={<Plus size={16} />} onClick={handleDealSubmit}>
                                    {editingDealId ? 'Сохранить' : 'Добавить'}
                                </Button>
                                {editingDealId && (
                                    <Button
                                        variant="default"
                                        onClick={() => {
                                            setEditingDealId(null)
                                            setDealForm(emptyDealForm)
                                            dealEditHandlers.close()
                                        }}
                                    >
                                        Сбросить
                                    </Button>
                                )}
                            </Group>
                        </Card>

                        <Tabs defaultValue="all" variant="pills" radius="xl">
                            <Tabs.List>
                                <Tabs.Tab value="all">Все</Tabs.Tab>
                                <Tabs.Tab value="active">Активные</Tabs.Tab>
                                {DEAL_STATUSES.map((status) => (
                                    <Tabs.Tab key={status} value={status}>
                                        {STATUS_NAMES[status]}
                                    </Tabs.Tab>
                                ))}
                            </Tabs.List>
                            <Tabs.Panel value="all" pt="lg">
                                <Stack>
                                    {dealDetails.map((details) => {
                                        const progress = getDealProgress(details.deal)
                                        return (
                                            <Card key={details.deal.id} withBorder radius="xl">
                                                <Group justify="space-between" align="flex-start" wrap="wrap">
                                                    <Stack gap={4}>
                                                        <Group gap="xs" wrap="wrap">
                                                            <Title order={4}>
                                                                {details.property?.address ?? 'Без недвижимости'}
                                                            </Title>
                                                            <Badge>{STATUS_NAMES[details.deal.status]}</Badge>
                                                        </Group>
                                                        <Text c="dimmed">
                                                            Покупатель:{' '}
                                                            {details.buyer
                                                                ? `${details.buyer.lastName} ${details.buyer.firstName}`
                                                                : '—'}
                                                        </Text>
                                                        <Text c="dimmed">
                                                            Продавец:{' '}
                                                            {details.seller
                                                                ? `${details.seller.lastName} ${details.seller.firstName}`
                                                                : '—'}
                                                        </Text>
                                                        <Text c="dimmed">
                                                            Сумма: {formatMoney(details.deal.amount)}
                                                        </Text>
                                                    </Stack>
                                                    <Badge size="lg" variant="light">
                                                        {progress}%
                                                    </Badge>
                                                </Group>
                                                <Divider my="md" />
                                                <Group justify="space-between" align="flex-start" wrap="wrap">
                                                    {renderDealActions(details.deal.id)}
                                                </Group>
                                                <Divider my="md" />
                                                <SimpleGrid cols={{ base: 1, lg: 2 }}>
                                                    <Card withBorder radius="lg">
                                                        <Text fw={600} mb="sm">
                                                            История
                                                        </Text>
                                                        <Stack gap="xs">
                                                            {details.deal.history.length ? (
                                                                details.deal.history.map((entry) => (
                                                                    <Card key={entry.id} withBorder radius="md">
                                                                        <Text size="sm" fw={600}>
                                                                            {STATUS_NAMES[entry.fromStatus]} →{' '}
                                                                            {STATUS_NAMES[entry.toStatus]}
                                                                        </Text>
                                                                        <Text size="xs" c="dimmed">
                                                                            {formatDate(entry.changedAt)} ·{' '}
                                                                            {entry.changedBy}
                                                                        </Text>
                                                                        {entry.reason && (
                                                                            <Text size="xs" mt={4}>
                                                                                {entry.reason}
                                                                            </Text>
                                                                        )}
                                                                    </Card>
                                                                ))
                                                            ) : (
                                                                <Text size="sm" c="dimmed">
                                                                    Пока без событий
                                                                </Text>
                                                            )}
                                                        </Stack>
                                                    </Card>
                                                    <Card withBorder radius="lg">
                                                        <Text fw={600} mb="sm">
                                                            Документы
                                                        </Text>
                                                        <Stack gap="xs">
                                                            {details.documents.map((document) => (
                                                                <Group
                                                                    key={document.id}
                                                                    justify="space-between"
                                                                    wrap="nowrap"
                                                                >
                                                                    <div>
                                                                        <Text size="sm" fw={600}>
                                                                            {document.name}
                                                                        </Text>
                                                                        <Text size="xs" c="dimmed">
                                                                            {document.type}
                                                                        </Text>
                                                                    </div>
                                                                    <Switch
                                                                        checked={document.isProvided}
                                                                        onChange={(event) =>
                                                                            setDocumentProvided(
                                                                                document.id,
                                                                                event.currentTarget.checked
                                                                            )
                                                                        }
                                                                    />
                                                                </Group>
                                                            ))}
                                                        </Stack>
                                                    </Card>
                                                </SimpleGrid>
                                            </Card>
                                        )
                                    })}
                                </Stack>
                            </Tabs.Panel>
                            <Tabs.Panel value="active" pt="lg">
                                <Stack>
                                    {dealDetails
                                        .filter(
                                            (details) =>
                                                details.deal.status !== 'completed' &&
                                                details.deal.status !== 'cancelled'
                                        )
                                        .map((details) => (
                                            <Card key={details.deal.id} withBorder radius="xl">
                                                <Group justify="space-between" wrap="wrap">
                                                    <Stack gap={2}>
                                                        <Text fw={700}>
                                                            {details.property?.address ?? 'Без недвижимости'}
                                                        </Text>
                                                        <Text size="sm" c="dimmed">
                                                            {STATUS_NAMES[details.deal.status]}
                                                        </Text>
                                                    </Stack>
                                                    {renderDealActions(details.deal.id)}
                                                </Group>
                                            </Card>
                                        ))}
                                </Stack>
                            </Tabs.Panel>
                            {DEAL_STATUSES.map((status) => (
                                <Tabs.Panel key={status} value={status} pt="lg">
                                    <Stack>
                                        {dealDetails
                                            .filter((details) => details.deal.status === status)
                                            .map((details) => (
                                                <Card key={details.deal.id} withBorder radius="xl">
                                                    <Group justify="space-between" wrap="wrap">
                                                        <Stack gap={2}>
                                                            <Text fw={700}>
                                                                {details.property?.address ?? 'Без недвижимости'}
                                                            </Text>
                                                            <Text size="sm" c="dimmed">
                                                                {details.buyer?.lastName} {details.buyer?.firstName}
                                                            </Text>
                                                        </Stack>
                                                        {renderDealActions(details.deal.id)}
                                                    </Group>
                                                </Card>
                                            ))}
                                    </Stack>
                                </Tabs.Panel>
                            ))}
                        </Tabs>
                    </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="documents" pt="lg">
                    <Stack gap="lg" id="documents-section">
                        {dealDetails.map((details) => (
                            <Card key={details.deal.id} withBorder radius="xl">
                                <Group justify="space-between" wrap="wrap">
                                    <Stack gap={2}>
                                        <Title order={4}>{details.property?.address ?? 'Без недвижимости'}</Title>
                                        <Text c="dimmed">
                                            {details.buyer?.lastName} {details.buyer?.firstName} ·{' '}
                                            {STATUS_NAMES[details.deal.status]}
                                        </Text>
                                    </Stack>
                                    <Badge
                                        color={
                                            details.documents.every(
                                                (document) => !document.isRequired || document.isProvided
                                            )
                                                ? 'green'
                                                : 'yellow'
                                        }
                                        leftSection={
                                            details.documents.every(
                                                (document) => !document.isRequired || document.isProvided
                                            ) ? (
                                                <Check size={14} />
                                            ) : undefined
                                        }
                                    >
                                        {details.documents.filter((document) => document.isProvided).length}/
                                        {details.documents.length}
                                    </Badge>
                                </Group>
                                <Divider my="md" />
                                <Stack gap="xs">
                                    {details.documents.map((document) => (
                                        <Group key={document.id} justify="space-between" wrap="nowrap">
                                            <Stack gap={0}>
                                                <Text fw={600}>{document.name}</Text>
                                                <Text size="xs" c="dimmed">
                                                    {document.type} ·{' '}
                                                    {document.isRequired ? 'обязательный' : 'необязательный'}
                                                </Text>
                                            </Stack>
                                            <Switch
                                                checked={document.isProvided}
                                                onChange={(event) =>
                                                    setDocumentProvided(document.id, event.currentTarget.checked)
                                                }
                                            />
                                        </Group>
                                    ))}
                                </Stack>
                            </Card>
                        ))}
                    </Stack>
                </Tabs.Panel>
            </Tabs>

            <Modal
                opened={propertyEditOpened}
                onClose={propertyEditHandlers.close}
                title="Редактировать недвижимость"
                size="lg"
            >
                <Stack>
                    <TextInput
                        label="Адрес"
                        value={propertyForm.address}
                        onChange={(event) => setPropertyForm((prev) => ({ ...prev, address: event.target.value }))}
                    />
                    <TextInput
                        label="Кадастровый номер"
                        value={propertyForm.cadastralNumber}
                        onChange={(event) =>
                            setPropertyForm((prev) => ({ ...prev, cadastralNumber: event.target.value }))
                        }
                    />
                    <Group grow>
                        <NumberInput
                            label="Площадь"
                            value={propertyForm.area}
                            onChange={(value) => setPropertyForm((prev) => ({ ...prev, area: Number(value) || 0 }))}
                        />
                        <NumberInput
                            label="Цена"
                            value={propertyForm.price}
                            onChange={(value) => setPropertyForm((prev) => ({ ...prev, price: Number(value) || 0 }))}
                        />
                    </Group>
                    <Group grow>
                        <NumberInput
                            label="Комнаты"
                            value={propertyForm.rooms}
                            onChange={(value) =>
                                setPropertyForm((prev) => ({ ...prev, rooms: value === '' ? '' : Number(value) || 0 }))
                            }
                        />
                        <NumberInput
                            label="Этаж"
                            value={propertyForm.floor}
                            onChange={(value) =>
                                setPropertyForm((prev) => ({ ...prev, floor: value === '' ? '' : Number(value) || 0 }))
                            }
                        />
                        <NumberInput
                            label="Этажность"
                            value={propertyForm.totalFloors}
                            onChange={(value) =>
                                setPropertyForm((prev) => ({
                                    ...prev,
                                    totalFloors: value === '' ? '' : Number(value) || 0
                                }))
                            }
                        />
                    </Group>
                    <Textarea
                        label="Описание"
                        value={propertyForm.description}
                        onChange={(event) => setPropertyForm((prev) => ({ ...prev, description: event.target.value }))}
                    />
                    <Group justify="flex-end">
                        <Button onClick={handlePropertySubmit}>Сохранить</Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal
                opened={userEditOpened}
                onClose={userEditHandlers.close}
                title="Редактировать пользователя"
                size="lg"
            >
                <Stack>
                    <SimpleGrid cols={{ base: 1, md: 2 }}>
                        <TextInput
                            label="Имя"
                            value={userForm.firstName}
                            onChange={(event) => setUserForm((prev) => ({ ...prev, firstName: event.target.value }))}
                        />
                        <TextInput
                            label="Фамилия"
                            value={userForm.lastName}
                            onChange={(event) => setUserForm((prev) => ({ ...prev, lastName: event.target.value }))}
                        />
                        <TextInput
                            label="Отчество"
                            value={userForm.middleName}
                            onChange={(event) => setUserForm((prev) => ({ ...prev, middleName: event.target.value }))}
                        />
                        <Select
                            label="Роль"
                            data={[
                                { value: 'buyer', label: 'Buyer' },
                                { value: 'seller', label: 'Seller' },
                                { value: 'both', label: 'Both' }
                            ]}
                            value={userForm.role}
                            onChange={(value) =>
                                setUserForm((prev) => ({ ...prev, role: (value as UserForm['role']) ?? 'buyer' }))
                            }
                        />
                        <TextInput
                            label="Телефон"
                            value={userForm.phone}
                            onChange={(event) => setUserForm((prev) => ({ ...prev, phone: event.target.value }))}
                        />
                        <TextInput
                            label="Email"
                            value={userForm.email}
                            onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
                        />
                        <TextInput
                            label="Серия паспорта"
                            value={userForm.passportSeries}
                            onChange={(event) =>
                                setUserForm((prev) => ({ ...prev, passportSeries: event.target.value }))
                            }
                        />
                        <TextInput
                            label="Номер паспорта"
                            value={userForm.passportNumber}
                            onChange={(event) =>
                                setUserForm((prev) => ({ ...prev, passportNumber: event.target.value }))
                            }
                        />
                        <TextInput
                            label="Кем выдан"
                            value={userForm.passportIssuedBy}
                            onChange={(event) =>
                                setUserForm((prev) => ({ ...prev, passportIssuedBy: event.target.value }))
                            }
                        />
                        <TextInput
                            label="Дата выдачи"
                            value={userForm.passportIssuedAt}
                            onChange={(event) =>
                                setUserForm((prev) => ({ ...prev, passportIssuedAt: event.target.value }))
                            }
                        />
                        <TextInput
                            label="ИНН"
                            value={userForm.inn}
                            onChange={(event) => setUserForm((prev) => ({ ...prev, inn: event.target.value }))}
                        />
                    </SimpleGrid>
                    <Group justify="flex-end">
                        <Button onClick={handleUserSubmit}>Сохранить</Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal opened={dealEditOpened} onClose={dealEditHandlers.close} title="Редактировать сделку" size="lg">
                <Stack>
                    <Select
                        label="Недвижимость"
                        data={propertySelectData}
                        value={dealForm.propertyId}
                        onChange={(value) => setDealForm((prev) => ({ ...prev, propertyId: value ?? '' }))}
                        searchable
                    />
                    <Select
                        label="Покупатель"
                        data={userSelectData}
                        value={dealForm.buyerId}
                        onChange={(value) => setDealForm((prev) => ({ ...prev, buyerId: value ?? '' }))}
                        searchable
                    />
                    <Select
                        label="Продавец"
                        data={userSelectData}
                        value={dealForm.sellerId}
                        onChange={(value) => setDealForm((prev) => ({ ...prev, sellerId: value ?? '' }))}
                        searchable
                    />
                    <Group grow>
                        <NumberInput
                            label="Сумма"
                            value={dealForm.amount}
                            onChange={(value) => setDealForm((prev) => ({ ...prev, amount: Number(value) || 0 }))}
                        />
                        <NumberInput
                            label="Задаток"
                            value={dealForm.depositAmount}
                            onChange={(value) =>
                                setDealForm((prev) => ({
                                    ...prev,
                                    depositAmount: value === '' ? '' : Number(value) || 0
                                }))
                            }
                        />
                        <NumberInput
                            label="Финальная сумма"
                            value={dealForm.finalAmount}
                            onChange={(value) =>
                                setDealForm((prev) => ({
                                    ...prev,
                                    finalAmount: value === '' ? '' : Number(value) || 0
                                }))
                            }
                        />
                    </Group>
                    <TextInput
                        label="Номер Росреестра"
                        value={dealForm.rosreestrNumber}
                        onChange={(event) => setDealForm((prev) => ({ ...prev, rosreestrNumber: event.target.value }))}
                    />
                    <Group justify="flex-end">
                        <Button onClick={handleDealSubmit}>Сохранить</Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal opened={cancelOpened} onClose={cancelHandlers.close} title="Отмена сделки" size="md">
                <Stack>
                    <Textarea
                        label="Причина"
                        value={cancelReason}
                        onChange={(event) => setCancelReason(event.target.value)}
                    />
                    <Group justify="flex-end">
                        <Button color="red" onClick={confirmCancelDeal}>
                            Отменить сделку
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    )
}
