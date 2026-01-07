import { z } from 'zod';

// ============== AUTH VALIDATORS ==============

export const registerSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z
        .string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
        .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    phone: z
        .string()
        .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ')
        .optional(),
    role: z.enum(['USER', 'LANDLORD']).default('USER'),
});

export const loginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

// ============== USER VALIDATORS ==============

export const updateUserSchema = z.object({
    fullName: z.string().min(2).optional(),
    phone: z
        .string()
        .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/)
        .optional()
        .nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    identityCard: z.string().max(20).optional().nullable(),
    gender: z.enum(['male', 'female', 'other']).optional().nullable(),
    permanentAddress: z.string().optional().nullable(),
    occupation: z.string().optional().nullable(),
    workplace: z.string().optional().nullable(),
});

// ============== MOTEL VALIDATORS ==============

export const createMotelSchema = z.object({
    name: z.string().min(2, 'Tên nhà trọ phải có ít nhất 2 ký tự'),
    address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
    province: z.string().optional(),
    district: z.string().optional(),
    ward: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    description: z.string().optional(),
    totalFloors: z.number().int().positive().optional(),
    rules: z.string().optional(),
});

export const updateMotelSchema = createMotelSchema.partial();

// ============== ROOM VALIDATORS ==============

export const createRoomSchema = z.object({
    name: z.string().min(1, 'Tên phòng không được để trống'),
    floor: z.number().int().positive().optional(),
    area: z.number().positive('Diện tích phải lớn hơn 0').optional(),
    roomType: z.enum(['SINGLE', 'DOUBLE', 'FAMILY', 'STUDIO']).default('SINGLE'),
    price: z.number().positive('Giá thuê phải lớn hơn 0'),
    deposit: z.number().min(0).optional(),
    maxTenants: z.number().int().positive().optional(),
    description: z.string().optional(),
    utilities: z.array(z.string().uuid()).optional(),
});

export const updateRoomSchema = createRoomSchema.partial();

// ============== SERVICE VALIDATORS ==============

export const createServiceSchema = z.object({
    name: z.string().min(1, 'Tên dịch vụ không được để trống'),
    price: z.number().positive('Giá dịch vụ phải lớn hơn 0'),
    unit: z.string().optional(),
    type: z.enum(['FIXED', 'USAGE', 'PEOPLE']).default('FIXED'),
    isRequired: z.boolean().default(true),
});

// ============== APPOINTMENT VALIDATORS ==============

export const createAppointmentSchema = z.object({
    roomId: z.string().uuid(),
    visitDate: z.string().datetime(),
    guestName: z.string().min(2).optional(),
    guestPhone: z
        .string()
        .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/)
        .optional(),
    guestEmail: z.string().email().optional(),
    note: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
    note: z.string().optional(),
    cancelledReason: z.string().optional(),
});

// ============== CONTRACT VALIDATORS ==============

export const createContractSchema = z.object({
    roomId: z.string().uuid(),
    tenantId: z.string().uuid().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
    durationMonths: z.number().int().positive().optional(),
    rentPrice: z.number().positive('Giá thuê phải lớn hơn 0'),
    depositAmount: z.number().min(0).optional(),
    paymentDueDay: z.number().int().min(1).max(28).optional(),
    notes: z.string().optional(),
    tenants: z
        .array(
            z.object({
                fullName: z.string().min(2),
                phone: z.string().optional(),
                email: z.string().email().optional(),
                identityCard: z.string().optional(),
                dateOfBirth: z.string().optional(),
                gender: z.string().optional(),
                relationship: z.string().optional(),
                isPrimary: z.boolean().default(false),
            })
        )
        .optional(),
});

// ============== INVOICE VALIDATORS ==============

export const generateInvoicesSchema = z.object({
    motelId: z.string().uuid(),
    billingMonth: z.string(), // YYYY-MM format
    meterReadings: z.array(
        z.object({
            roomId: z.string().uuid(),
            electricity: z.object({
                oldIndex: z.number(),
                newIndex: z.number(),
            }),
            water: z.object({
                oldIndex: z.number(),
                newIndex: z.number(),
            }),
        })
    ),
});

export const recordPaymentSchema = z.object({
    amount: z.number().positive('Số tiền phải lớn hơn 0'),
    paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'MOMO', 'VNPAY', 'ZALOPAY']),
    notes: z.string().optional(),
});

// ============== MAINTENANCE VALIDATORS ==============

export const createMaintenanceSchema = z.object({
    roomId: z.string().uuid(),
    title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    images: z.array(z.string().url()).optional(),
});

export const updateMaintenanceStatusSchema = z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED']),
    assignedToId: z.string().uuid().optional(),
    estimatedCost: z.number().optional(),
    actualCost: z.number().optional(),
    notes: z.string().optional(),
    completionImages: z.array(z.string().url()).optional(),
});

// ============== REVIEW VALIDATORS ==============

export const createReviewSchema = z.object({
    overallRating: z.number().int().min(1).max(5).optional(),
    locationRating: z.number().int().min(1).max(5).optional(),
    priceRating: z.number().int().min(1).max(5).optional(),
    cleanlinessRating: z.number().int().min(1).max(5).optional(),
    landlordRating: z.number().int().min(1).max(5).optional(),
    amenitiesRating: z.number().int().min(1).max(5).optional(),
    content: z.string().optional(),
    images: z.array(z.string().url()).optional(),
});

export const updateReviewSchema = createReviewSchema.partial();

// ============== RESERVATION VALIDATORS ==============

export const createReservationSchema = z.object({
    roomId: z.string().uuid(),
    intendedStartDate: z.string(),
    depositAmount: z.number().positive(),
});

// ============== SEARCH VALIDATORS ==============

export const searchRoomsSchema = z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    radius: z.number().positive().default(30),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    minArea: z.number().optional(),
    maxArea: z.number().optional(),
    roomType: z.enum(['SINGLE', 'DOUBLE', 'FAMILY', 'STUDIO']).optional(),
    utilities: z.array(z.string().uuid()).optional(),
    sortBy: z.enum(['distance', 'price', 'rating']).optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(50).default(10),
});

// ============== MESSAGE VALIDATORS ==============

export const sendMessageSchema = z.object({
    receiverId: z.string().uuid(),
    content: z.string().min(1),
    messageType: z.enum(['text', 'image', 'file']).default('text'),
    attachments: z.array(z.string().url()).optional(),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateMotelInput = z.infer<typeof createMotelSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type GenerateInvoicesInput = z.infer<typeof generateInvoicesSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type SearchRoomsInput = z.infer<typeof searchRoomsSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
