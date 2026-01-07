import 'dotenv/config';
import { PrismaClient, Role, MotelStatus, RoomStatus, RoomType, ServiceType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Initialize Prisma with pg adapter (required by Prisma 7+)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// =============================================================================
// MOCK DATA FROM THUETRO FRONTEND
// =============================================================================

// Sample images from Unsplash
const roomImages = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
];

const avatars = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
];

// Landlords/Owners data
const ownersData = [
    { name: 'Nguyễn Minh Tâm', phone: '0901234567', email: 'minhtam@nhatro.vn', avatar: avatars[0] },
    { name: 'Trần Thị Hương', phone: '0912345678', email: 'huong@nhatro.vn', avatar: avatars[1] },
    { name: 'Lê Văn Thành', phone: '0923456789', email: 'thanh@nhatro.vn', avatar: avatars[2] },
    { name: 'Phạm Anh Dũng', phone: '0934567890', email: 'dung@nhatro.vn', avatar: avatars[3] },
    { name: 'Nguyễn Thị Mai', phone: '0945678901', email: 'mai@nhatro.vn', avatar: avatars[1] },
    { name: 'Võ Minh Tuấn', phone: '0956789012', email: 'tuan@nhatro.vn', avatar: avatars[0] },
    { name: 'Trần Văn Phú', phone: '0967890123', email: 'phu@nhatro.vn', avatar: avatars[2] },
    { name: 'Lê Thị Nga', phone: '0978901234', email: 'nga@nhatro.vn', avatar: avatars[1] },
    { name: 'Hoàng Văn Long', phone: '0989012345', email: 'long@nhatro.vn', avatar: avatars[3] },
    { name: 'Nguyễn Thành Đạt', phone: '0990123456', email: 'dat@nhatro.vn', avatar: avatars[0] },
];

// Tenants/Users for reviews
const tenantsData = [
    { name: 'Trần Văn An', phone: '0911111111', email: 'an@gmail.com', avatar: avatars[2] },
    { name: 'Lê Thị Bình', phone: '0922222222', email: 'binh@gmail.com', avatar: avatars[1] },
    { name: 'Nguyễn Hoàng Nam', phone: '0933333333', email: 'nam@gmail.com', avatar: avatars[3] },
    { name: 'Phạm Thị Lan', phone: '0944444444', email: 'lan@gmail.com', avatar: avatars[1] },
];

// Motels/Properties data
const motelsData = [
    {
        name: 'Nhà Trọ Minh Tâm',
        address: '123 Nguyễn Văn Cừ, Phường 4',
        district: 'Quận 5',
        province: 'TP. Hồ Chí Minh',
        ward: 'Phường 4',
        description: 'Nhà trọ cao cấp với đầy đủ tiện nghi, an ninh 24/7, gần trung tâm thành phố.',
        totalFloors: 4,
        totalRooms: 12,
        latitude: 10.7623,
        longitude: 106.6827,
        ownerIndex: 0,
        images: [roomImages[0], roomImages[1], roomImages[2]],
    },
    {
        name: 'Căn Hộ Mini Sunshine',
        address: '456 Điện Biên Phủ, Phường 21',
        district: 'Bình Thạnh',
        province: 'TP. Hồ Chí Minh',
        ward: 'Phường 21',
        description: 'Căn hộ mini full nội thất cao cấp, view công viên, thang máy, bảo vệ 24/7.',
        totalFloors: 5,
        totalRooms: 20,
        latitude: 10.8031,
        longitude: 106.7144,
        ownerIndex: 1,
        images: [roomImages[1], roomImages[0], roomImages[4]],
    },
    {
        name: 'KTX Sinh Viên Thành Công',
        address: '789 Lý Thường Kiệt, Phường 14',
        district: 'Quận 10',
        province: 'TP. Hồ Chí Minh',
        ward: 'Phường 14',
        description: 'Ký túc xá sinh viên giá rẻ, môi trường học tập tốt, gần các trường đại học.',
        totalFloors: 6,
        totalRooms: 50,
        latitude: 10.7726,
        longitude: 106.6602,
        ownerIndex: 2,
        images: [roomImages[4], roomImages[5], roomImages[0]],
    },
    {
        name: 'Nhà Trọ An Phú',
        address: '101 Nguyễn Hữu Cảnh, Phường 22',
        district: 'Bình Thạnh',
        province: 'TP. Hồ Chí Minh',
        ward: 'Phường 22',
        description: 'Nhà trọ cao cấp view sông, nội thất sang trọng, dịch vụ 5 sao.',
        totalFloors: 10,
        totalRooms: 8,
        latitude: 10.7944,
        longitude: 106.7216,
        ownerIndex: 3,
        images: [roomImages[5], roomImages[1], roomImages[2]],
    },
    {
        name: 'Nhà Trọ Hoa Mai',
        address: '222 Lý Thường Kiệt, Phường 15',
        district: 'Quận 10',
        province: 'TP. Hồ Chí Minh',
        ward: 'Phường 15',
        description: 'Nhà trọ yên tĩnh gần ĐH Bách Khoa, phù hợp cho sinh viên.',
        totalFloors: 4,
        totalRooms: 15,
        latitude: 10.7731,
        longitude: 106.6580,
        ownerIndex: 4,
        images: [roomImages[0], roomImages[3], roomImages[4]],
    },
    {
        name: 'Chung Cư Mini Phú Mỹ',
        address: '333 Nguyễn Xí, Phường 26',
        district: 'Bình Thạnh',
        province: 'TP. Hồ Chí Minh',
        ward: 'Phường 26',
        description: 'Chung cư mini hiện đại, cho phép nuôi thú cưng, có sân vườn.',
        totalFloors: 5,
        totalRooms: 24,
        latitude: 10.8124,
        longitude: 106.7089,
        ownerIndex: 5,
        images: [roomImages[2], roomImages[0], roomImages[1]],
    },
    {
        name: 'Nhà Trọ Tân Phú',
        address: '55 Âu Cơ, Phường 9',
        district: 'Tân Bình',
        province: 'TP. Hồ Chí Minh',
        ward: 'Phường 9',
        description: 'Nhà trọ giá rẻ gần sân bay, thuận tiện di chuyển.',
        totalFloors: 4,
        totalRooms: 18,
        latitude: 10.8102,
        longitude: 106.6285,
        ownerIndex: 6,
        images: [roomImages[3], roomImages[2], roomImages[5]],
    },
    {
        name: 'Căn Hộ Dịch Vụ Gò Vấp',
        address: '77 Phan Văn Trị, Phường 7',
        district: 'Gò Vấp',
        province: 'TP. Hồ Chí Minh',
        ward: 'Phường 7',
        description: 'Căn hộ dịch vụ full nội thất, dọn phòng hàng tuần.',
        totalFloors: 6,
        totalRooms: 30,
        latitude: 10.8388,
        longitude: 106.6732,
        ownerIndex: 7,
        images: [roomImages[1], roomImages[4], roomImages[0]],
    },
    {
        name: 'Nhà Trọ Phú Nhuận Central',
        address: '99 Phan Xích Long, Phường 2',
        district: 'Phú Nhuận',
        province: 'TP. Hồ Chí Minh',
        ward: 'Phường 2',
        description: 'Nhà trọ trung tâm Phú Nhuận, gần chợ và siêu thị.',
        totalFloors: 3,
        totalRooms: 10,
        latitude: 10.7989,
        longitude: 106.6821,
        ownerIndex: 8,
        images: [roomImages[5], roomImages[3], roomImages[1]],
    },
    {
        name: 'Ký Túc Xá Thủ Đức',
        address: '188 Võ Văn Ngân, Phường Linh Chiểu',
        district: 'Thủ Đức',
        province: 'TP. Hồ Chí Minh',
        ward: 'Phường Linh Chiểu',
        description: 'KTX sinh viên gần làng đại học, giá siêu rẻ.',
        totalFloors: 8,
        totalRooms: 100,
        latitude: 10.8505,
        longitude: 106.7720,
        ownerIndex: 9,
        images: [roomImages[4], roomImages[2], roomImages[0]],
    },
];

// Rooms data (will be linked to motels)
const roomsData = [
    {
        motelIndex: 0,
        name: 'Phòng 101 - Studio cao cấp',
        price: 4500000,
        deposit: 9000000,
        area: 25,
        floor: 1,
        maxTenants: 2,
        roomType: 'STUDIO' as RoomType,
        description: 'Phòng studio cao cấp với đầy đủ tiện nghi, view đẹp, gần trung tâm. Thích hợp cho sinh viên hoặc nhân viên văn phòng.',
        images: [roomImages[0], roomImages[1], roomImages[2]],
    },
    {
        motelIndex: 0,
        name: 'Phòng 202 - Phòng đôi rộng rãi',
        price: 3800000,
        deposit: 7600000,
        area: 20,
        floor: 2,
        maxTenants: 2,
        roomType: 'DOUBLE' as RoomType,
        description: 'Phòng đôi thoáng mát, có cửa sổ lớn, an ninh tốt. Gần chợ và siêu thị tiện lợi.',
        images: [roomImages[3], roomImages[4], roomImages[5]],
    },
    {
        motelIndex: 1,
        name: 'Studio A1 - Full nội thất',
        price: 5200000,
        deposit: 10400000,
        area: 30,
        floor: 3,
        maxTenants: 2,
        roomType: 'STUDIO' as RoomType,
        description: 'Căn hộ mini full nội thất cao cấp, có bếp riêng, view công viên. Phù hợp cho cặp đôi hoặc người đi làm.',
        images: [roomImages[1], roomImages[0], roomImages[4]],
    },
    {
        motelIndex: 1,
        name: 'Studio B2 - Giá tốt',
        price: 4000000,
        deposit: 8000000,
        area: 22,
        floor: 2,
        maxTenants: 2,
        roomType: 'STUDIO' as RoomType,
        description: 'Căn hộ mini giá hợp lý, đầy đủ tiện nghi cơ bản. Gần trạm xe buýt và trường đại học.',
        images: [roomImages[2], roomImages[3], roomImages[5]],
    },
    {
        motelIndex: 2,
        name: 'Phòng KTX 4 người - Nam',
        price: 1500000,
        deposit: 3000000,
        area: 28,
        floor: 1,
        maxTenants: 4,
        roomType: 'FAMILY' as RoomType,
        description: 'Phòng ký túc xá 4 giường tầng, dành cho nam. Môi trường học tập tốt, gần các trường đại học lớn.',
        images: [roomImages[4], roomImages[5], roomImages[0]],
    },
    {
        motelIndex: 3,
        name: 'Phòng VIP - Penthouse view sông',
        price: 8500000,
        deposit: 17000000,
        area: 45,
        floor: 10,
        maxTenants: 2,
        roomType: 'STUDIO' as RoomType,
        description: 'Phòng penthouse cao cấp với view sông tuyệt đẹp. Nội thất sang trọng, dịch vụ 5 sao. Thích hợp cho người có thu nhập cao.',
        images: [roomImages[5], roomImages[1], roomImages[2]],
    },
    {
        motelIndex: 4,
        name: 'Phòng 301 - Gần ĐH Bách Khoa',
        price: 2800000,
        deposit: 5600000,
        area: 18,
        floor: 3,
        maxTenants: 1,
        roomType: 'SINGLE' as RoomType,
        description: 'Phòng đơn sạch sẽ, yên tĩnh. Đi bộ 5 phút đến ĐH Bách Khoa. Phù hợp cho sinh viên.',
        images: [roomImages[0], roomImages[3], roomImages[4]],
    },
    {
        motelIndex: 5,
        name: 'Căn 1PN - Tầng trệt',
        price: 6000000,
        deposit: 12000000,
        area: 35,
        floor: 1,
        maxTenants: 2,
        roomType: 'DOUBLE' as RoomType,
        description: 'Căn hộ 1 phòng ngủ tầng trệt, tiện lợi cho người già hoặc gia đình có trẻ nhỏ. Có sân vườn riêng.',
        images: [roomImages[2], roomImages[0], roomImages[1]],
    },
    // Additional rooms for each motel
    {
        motelIndex: 6,
        name: 'Phòng 101 - Standard',
        price: 2500000,
        deposit: 5000000,
        area: 18,
        floor: 1,
        maxTenants: 2,
        roomType: 'SINGLE' as RoomType,
        description: 'Phòng tiêu chuẩn gần sân bay, thuận tiện đi lại. Giá rẻ, phù hợp cho nhân viên văn phòng.',
        images: [roomImages[3], roomImages[2], roomImages[5]],
    },
    {
        motelIndex: 7,
        name: 'Suite Deluxe',
        price: 7000000,
        deposit: 14000000,
        area: 40,
        floor: 5,
        maxTenants: 2,
        roomType: 'STUDIO' as RoomType,
        description: 'Suite cao cấp với dịch vụ dọn phòng hàng tuần. Nội thất đầy đủ, sẵn sàng về ở ngay.',
        images: [roomImages[1], roomImages[4], roomImages[0]],
    },
    {
        motelIndex: 8,
        name: 'Phòng 201 - Tiện nghi',
        price: 3500000,
        deposit: 7000000,
        area: 22,
        floor: 2,
        maxTenants: 2,
        roomType: 'DOUBLE' as RoomType,
        description: 'Phòng tiện nghi trung tâm Phú Nhuận. Gần chợ, siêu thị và các tiện ích.',
        images: [roomImages[5], roomImages[3], roomImages[1]],
    },
    {
        motelIndex: 9,
        name: 'Phòng KTX 6 người',
        price: 1200000,
        deposit: 2400000,
        area: 35,
        floor: 2,
        maxTenants: 6,
        roomType: 'FAMILY' as RoomType,
        description: 'Phòng KTX 6 giường cho sinh viên. Gần làng đại học, có sân thể thao.',
        images: [roomImages[4], roomImages[2], roomImages[0]],
    },
];

// Reviews data
const reviewsData = [
    {
        roomIndex: 0,
        tenantIndex: 0,
        overallRating: 5,
        locationRating: 5,
        priceRating: 4,
        cleanlinessRating: 5,
        landlordRating: 5,
        content: 'Phòng rất đẹp và sạch sẽ, chủ nhà thân thiện. Đã ở đây 6 tháng rất hài lòng!',
        rentalDuration: '6 tháng',
    },
    {
        roomIndex: 0,
        tenantIndex: 1,
        overallRating: 4,
        locationRating: 5,
        priceRating: 4,
        cleanlinessRating: 4,
        landlordRating: 4,
        content: 'Vị trí thuận tiện, giá cả hợp lý. Chỉ hơi ồn vào cuối tuần.',
        rentalDuration: '3 tháng',
    },
    {
        roomIndex: 2,
        tenantIndex: 2,
        overallRating: 5,
        locationRating: 5,
        priceRating: 5,
        cleanlinessRating: 5,
        landlordRating: 5,
        content: 'Căn hộ tuyệt vời, đầy đủ tiện nghi. View công viên rất đẹp!',
        rentalDuration: '12 tháng',
    },
    {
        roomIndex: 5,
        tenantIndex: 3,
        overallRating: 5,
        locationRating: 5,
        priceRating: 3,
        cleanlinessRating: 5,
        landlordRating: 5,
        content: 'Penthouse view sông tuyệt đẹp! Dịch vụ 5 sao, nội thất sang trọng. Giá hơi cao nhưng xứng đáng.',
        rentalDuration: '4 tháng',
    },
];

// Utilities master data
const utilitiesData = [
    { name: 'Wifi miễn phí', icon: 'wifi', category: 'internet' },
    { name: 'Điều hòa', icon: 'air-vent', category: 'appliances' },
    { name: 'Máy giặt', icon: 'washing-machine', category: 'appliances' },
    { name: 'Tủ lạnh', icon: 'refrigerator', category: 'appliances' },
    { name: 'Bếp riêng', icon: 'utensils', category: 'facilities' },
    { name: 'WC riêng', icon: 'bath', category: 'facilities' },
    { name: 'Ban công', icon: 'sun', category: 'facilities' },
    { name: 'Giường', icon: 'bed', category: 'furniture' },
    { name: 'Tủ quần áo', icon: 'archive', category: 'furniture' },
    { name: 'Bàn làm việc', icon: 'desk', category: 'furniture' },
    { name: 'Bãi đỗ xe', icon: 'car', category: 'facilities' },
    { name: 'Camera an ninh', icon: 'camera', category: 'security' },
    { name: 'Bảo vệ 24/7', icon: 'shield', category: 'security' },
    { name: 'Thang máy', icon: 'arrow-up', category: 'facilities' },
    { name: 'Cho nuôi thú cưng', icon: 'paw', category: 'other' },
    { name: 'Nóng lạnh', icon: 'thermometer', category: 'appliances' },
    { name: 'Cửa sổ', icon: 'square', category: 'facilities' },
];

// =============================================================================
// SEEDING FUNCTIONS
// =============================================================================

async function main() {
    console.log('🌱 Starting comprehensive database seeding...\n');

    // -------------------------------------------------------------------------
    // 1. Create Admin User
    // -------------------------------------------------------------------------
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@nhatro.vn' },
        update: {},
        create: {
            email: 'admin@nhatro.vn',
            password: adminPassword,
            fullName: 'Super Admin',
            role: Role.ADMIN,
            phone: '0900000001',
            emailVerified: true,
            avatarUrl: avatars[0],
        },
    });
    console.log(`   ✅ Admin: ${admin.email}`);

    // -------------------------------------------------------------------------
    // 2. Create Landlord Users (from owners data)
    // -------------------------------------------------------------------------
    console.log('\n👥 Creating landlord users...');
    const landlords: { id: string; email: string }[] = [];
    const landlordPassword = await bcrypt.hash('Landlord@123', 12);

    for (const owner of ownersData) {
        const landlord = await prisma.user.upsert({
            where: { email: owner.email },
            update: {},
            create: {
                email: owner.email,
                password: landlordPassword,
                fullName: owner.name,
                role: Role.LANDLORD,
                phone: owner.phone,
                emailVerified: true,
                avatarUrl: owner.avatar,
            },
        });
        landlords.push({ id: landlord.id, email: landlord.email });
        console.log(`   ✅ Landlord: ${landlord.fullName}`);
    }

    // -------------------------------------------------------------------------
    // 3. Create Tenant Users (for reviews)
    // -------------------------------------------------------------------------
    console.log('\n👥 Creating tenant users...');
    const tenants: { id: string; email: string }[] = [];
    const tenantPassword = await bcrypt.hash('Tenant@123', 12);

    for (const tenant of tenantsData) {
        const t = await prisma.user.upsert({
            where: { email: tenant.email },
            update: {},
            create: {
                email: tenant.email,
                password: tenantPassword,
                fullName: tenant.name,
                role: Role.TENANT,
                phone: tenant.phone,
                emailVerified: true,
                avatarUrl: tenant.avatar,
            },
        });
        tenants.push({ id: t.id, email: t.email });
        console.log(`   ✅ Tenant: ${t.fullName}`);
    }

    // -------------------------------------------------------------------------
    // 4. Create Utilities (master data)
    // -------------------------------------------------------------------------
    console.log('\n🔧 Creating utilities...');
    const utilities: { id: string; name: string }[] = [];

    for (const utility of utilitiesData) {
        // Check if utility already exists by name
        let u = await prisma.utility.findFirst({
            where: { name: utility.name },
        });

        if (!u) {
            u = await prisma.utility.create({
                data: {
                    name: utility.name,
                    icon: utility.icon,
                    category: utility.category,
                },
            });
        }
        utilities.push({ id: u.id, name: u.name });
    }
    console.log(`   ✅ Created ${utilities.length} utilities`);

    // -------------------------------------------------------------------------
    // 5. Create Motels with Images and Services
    // -------------------------------------------------------------------------
    console.log('\n🏠 Creating motels...');
    const motels: { id: string; name: string; ownerId: string }[] = [];

    for (let i = 0; i < motelsData.length; i++) {
        const motelData = motelsData[i];
        const ownerId = landlords[motelData.ownerIndex].id;

        const motel = await prisma.motel.create({
            data: {
                ownerId,
                name: motelData.name,
                address: motelData.address,
                province: motelData.province,
                district: motelData.district,
                ward: motelData.ward,
                latitude: motelData.latitude,
                longitude: motelData.longitude,
                description: motelData.description,
                totalFloors: motelData.totalFloors,
                totalRooms: motelData.totalRooms,
                status: MotelStatus.ACTIVE,
                rules: 'Không hút thuốc trong phòng. Giữ yên lặng sau 22h. Không nuôi thú cưng (trừ khi được phép).',
            },
        });
        motels.push({ id: motel.id, name: motel.name, ownerId });

        // Create motel images
        for (let j = 0; j < motelData.images.length; j++) {
            await prisma.motelImage.create({
                data: {
                    motelId: motel.id,
                    imageUrl: motelData.images[j],
                    isPrimary: j === 0,
                    sortOrder: j,
                },
            });
        }

        // Create default services for each motel
        const services = [
            { name: 'Tiền điện', price: 3500, unit: 'kWh', type: ServiceType.USAGE, isRequired: true },
            { name: 'Tiền nước', price: 15000, unit: 'm³', type: ServiceType.USAGE, isRequired: true },
            { name: 'Internet/Wifi', price: 100000, unit: 'tháng', type: ServiceType.FIXED, isRequired: false },
            { name: 'Gửi xe máy', price: 100000, unit: 'xe/tháng', type: ServiceType.FIXED, isRequired: false },
            { name: 'Phí rác', price: 20000, unit: 'người/tháng', type: ServiceType.PEOPLE, isRequired: true },
        ];

        for (const service of services) {
            await prisma.service.create({
                data: {
                    motelId: motel.id,
                    name: service.name,
                    price: service.price,
                    unit: service.unit,
                    type: service.type,
                    isRequired: service.isRequired,
                },
            });
        }

        console.log(`   ✅ Motel: ${motel.name} (${services.length} services, ${motelData.images.length} images)`);
    }

    // -------------------------------------------------------------------------
    // 6. Create Rooms with Images and Utilities
    // -------------------------------------------------------------------------
    console.log('\n🚪 Creating rooms...');
    const rooms: { id: string; name: string; motelId: string }[] = [];

    // Utility mapping for rooms
    const roomUtilityMap: Record<string, string[]> = {
        'Phòng 101 - Studio cao cấp': ['Wifi miễn phí', 'Điều hòa', 'Tủ lạnh', 'WC riêng', 'Ban công', 'Giường', 'Tủ quần áo'],
        'Phòng 202 - Phòng đôi rộng rãi': ['Wifi miễn phí', 'Điều hòa', 'WC riêng', 'Giường', 'Tủ quần áo', 'Bàn làm việc'],
        'Studio A1 - Full nội thất': ['Wifi miễn phí', 'Điều hòa', 'Máy giặt', 'Tủ lạnh', 'Bếp riêng', 'WC riêng', 'Ban công', 'Thang máy'],
        'Studio B2 - Giá tốt': ['Wifi miễn phí', 'Điều hòa', 'Tủ lạnh', 'WC riêng', 'Giường', 'Thang máy'],
        'Phòng KTX 4 người - Nam': ['Wifi miễn phí', 'Điều hòa', 'Giường', 'Tủ quần áo', 'Bàn làm việc', 'Bảo vệ 24/7'],
        'Phòng VIP - Penthouse view sông': ['Wifi miễn phí', 'Điều hòa', 'Máy giặt', 'Tủ lạnh', 'Bếp riêng', 'WC riêng', 'Ban công', 'Thang máy', 'Bảo vệ 24/7', 'Camera an ninh'],
        'Phòng 301 - Gần ĐH Bách Khoa': ['Wifi miễn phí', 'Điều hòa', 'WC riêng', 'Giường', 'Bàn làm việc'],
        'Căn 1PN - Tầng trệt': ['Wifi miễn phí', 'Điều hòa', 'Máy giặt', 'Tủ lạnh', 'Bếp riêng', 'WC riêng', 'Cho nuôi thú cưng', 'Bãi đỗ xe'],
        'Phòng 101 - Standard': ['Wifi miễn phí', 'Điều hòa', 'WC riêng', 'Giường', 'Bãi đỗ xe'],
        'Suite Deluxe': ['Wifi miễn phí', 'Điều hòa', 'Máy giặt', 'Tủ lạnh', 'Bếp riêng', 'WC riêng', 'Ban công', 'Thang máy'],
        'Phòng 201 - Tiện nghi': ['Wifi miễn phí', 'Điều hòa', 'WC riêng', 'Giường', 'Tủ quần áo', 'Cửa sổ'],
        'Phòng KTX 6 người': ['Wifi miễn phí', 'Điều hòa', 'Giường', 'Tủ quần áo', 'Bàn làm việc'],
    };

    for (const roomData of roomsData) {
        const motel = motels[roomData.motelIndex];

        const room = await prisma.room.create({
            data: {
                motelId: motel.id,
                name: roomData.name,
                floor: roomData.floor,
                area: roomData.area,
                roomType: roomData.roomType,
                price: roomData.price,
                deposit: roomData.deposit,
                maxTenants: roomData.maxTenants,
                status: RoomStatus.AVAILABLE,
                description: roomData.description,
            },
        });
        rooms.push({ id: room.id, name: room.name, motelId: room.motelId });

        // Create room images
        for (let j = 0; j < roomData.images.length; j++) {
            await prisma.roomImage.create({
                data: {
                    roomId: room.id,
                    imageUrl: roomData.images[j],
                    isPrimary: j === 0,
                    sortOrder: j,
                },
            });
        }

        // Create room utilities
        const roomUtilities = roomUtilityMap[roomData.name] || ['Wifi miễn phí', 'Điều hòa'];
        for (const utilityName of roomUtilities) {
            const utility = utilities.find(u => u.name === utilityName);
            if (utility) {
                await prisma.roomUtility.create({
                    data: {
                        roomId: room.id,
                        utilityId: utility.id,
                    },
                });
            }
        }

        console.log(`   ✅ Room: ${room.name} (${roomData.images.length} images, ${roomUtilities.length} utilities)`);
    }

    // -------------------------------------------------------------------------
    // 7. Create Reviews
    // -------------------------------------------------------------------------
    console.log('\n⭐ Creating reviews...');

    for (const reviewData of reviewsData) {
        const room = rooms[reviewData.roomIndex];
        const motel = motels.find(m => m.id === room.motelId);
        const tenant = tenants[reviewData.tenantIndex];

        if (motel) {
            await prisma.review.create({
                data: {
                    motelId: motel.id,
                    roomId: room.id,
                    userId: tenant.id,
                    overallRating: reviewData.overallRating,
                    locationRating: reviewData.locationRating,
                    priceRating: reviewData.priceRating,
                    cleanlinessRating: reviewData.cleanlinessRating,
                    landlordRating: reviewData.landlordRating,
                    content: reviewData.content,
                    rentalDuration: reviewData.rentalDuration,
                    isVerifiedTenant: true,
                    isVisible: true,
                },
            });
            console.log(`   ✅ Review for: ${room.name}`);
        }
    }

    // -------------------------------------------------------------------------
    // 8. Summary
    // -------------------------------------------------------------------------
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Seeding completed successfully!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   • Users: 1 admin + ${landlords.length} landlords + ${tenants.length} tenants`);
    console.log(`   • Motels: ${motels.length}`);
    console.log(`   • Rooms: ${rooms.length}`);
    console.log(`   • Utilities: ${utilities.length}`);
    console.log(`   • Reviews: ${reviewsData.length}`);

    console.log('\n📋 Test accounts:');
    console.log('   ┌─────────────────────────────────────────────────────────┐');
    console.log('   │ Role       │ Email                  │ Password         │');
    console.log('   ├─────────────────────────────────────────────────────────┤');
    console.log('   │ Admin      │ admin@nhatro.vn        │ Admin@123        │');
    console.log('   │ Landlord   │ minhtam@nhatro.vn      │ Landlord@123     │');
    console.log('   │ Tenant     │ an@gmail.com           │ Tenant@123       │');
    console.log('   └─────────────────────────────────────────────────────────┘');
    console.log('');
}

main()
    .then(async () => {
        await prisma.$disconnect();
        await pool.end();
    })
    .catch(async (e) => {
        console.error('❌ Seeding error:', e);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });
