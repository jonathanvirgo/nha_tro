import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@nhatro.vn' },
        update: {},
        create: {
            email: 'admin@nhatro.vn',
            password: adminPassword,
            fullName: 'Super Admin',
            role: 'ADMIN',
            phone: '0901234567',
            emailVerified: true,
        },
    });
    console.log(`✅ Created admin: ${admin.email}`);

    // Create landlord user
    const landlordPassword = await bcrypt.hash('Landlord@123', 12);
    const landlord = await prisma.user.upsert({
        where: { email: 'landlord@nhatro.vn' },
        update: {},
        create: {
            email: 'landlord@nhatro.vn',
            password: landlordPassword,
            fullName: 'Nguyễn Văn Chủ',
            role: 'LANDLORD',
            phone: '0901234568',
            emailVerified: true,
        },
    });
    console.log(`✅ Created landlord: ${landlord.email}`);

    // Create sample motel
    const motel = await prisma.motel.upsert({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000001',
            ownerId: landlord.id,
            name: 'Nhà trọ Hạnh Phúc',
            address: '123 Nguyễn Văn Linh, Phường Tân Phú, Quận 7',
            province: 'Hồ Chí Minh',
            district: 'Quận 7',
            ward: 'Phường Tân Phú',
            latitude: 10.7328,
            longitude: 106.7215,
            description: 'Nhà trọ cao cấp, an ninh 24/7, wifi miễn phí',
            totalFloors: 4,
            totalRooms: 20,
            rules: 'Không hút thuốc, không gây ồn sau 22h',
        },
    });
    console.log(`✅ Created motel: ${motel.name}`);

    // Create default services for motel
    const services = [
        { name: 'Tiền điện', price: 3500, unit: 'kWh', type: 'USAGE' as const },
        { name: 'Tiền nước', price: 15000, unit: 'm³', type: 'USAGE' as const },
        { name: 'Internet/Wifi', price: 100000, unit: 'tháng', type: 'FIXED' as const },
        { name: 'Gửi xe máy', price: 100000, unit: 'xe/tháng', type: 'FIXED' as const },
        { name: 'Rác', price: 20000, unit: 'người/tháng', type: 'PEOPLE' as const },
    ];

    for (const service of services) {
        await prisma.service.upsert({
            where: {
                id: `${motel.id}-${service.name}`.replace(/\s/g, '-').toLowerCase(),
            },
            update: {},
            create: {
                motelId: motel.id,
                ...service,
            },
        });
    }
    console.log(`✅ Created ${services.length} services`);

    // Create default utilities
    const utilities = [
        { name: 'Điều hòa', icon: 'air-vent', category: 'appliances' },
        { name: 'Nóng lạnh', icon: 'thermometer', category: 'appliances' },
        { name: 'Tủ lạnh', icon: 'refrigerator', category: 'appliances' },
        { name: 'Máy giặt', icon: 'washing-machine', category: 'appliances' },
        { name: 'Giường', icon: 'bed', category: 'furniture' },
        { name: 'Tủ quần áo', icon: 'archive', category: 'furniture' },
        { name: 'Bàn học', icon: 'desk', category: 'furniture' },
        { name: 'Toilet riêng', icon: 'bath', category: 'facilities' },
        { name: 'Ban công', icon: 'sun', category: 'facilities' },
        { name: 'Cửa sổ', icon: 'square', category: 'facilities' },
        { name: 'Bếp', icon: 'utensils', category: 'facilities' },
    ];

    for (const utility of utilities) {
        await prisma.utility.upsert({
            where: { id: utility.name.toLowerCase().replace(/\s/g, '-') },
            update: {},
            create: utility,
        });
    }
    console.log(`✅ Created ${utilities.length} utilities`);

    // Create sample rooms
    const rooms = [
        { name: 'Phòng 101', floor: 1, area: 20, price: 3000000, roomType: 'SINGLE' as const },
        { name: 'Phòng 102', floor: 1, area: 25, price: 3500000, roomType: 'DOUBLE' as const },
        { name: 'Phòng 201', floor: 2, area: 20, price: 3000000, roomType: 'SINGLE' as const },
        { name: 'Phòng 202', floor: 2, area: 30, price: 4000000, roomType: 'FAMILY' as const },
        { name: 'Phòng 301', floor: 3, area: 35, price: 4500000, roomType: 'STUDIO' as const },
    ];

    for (const room of rooms) {
        await prisma.room.upsert({
            where: { id: `${motel.id}-${room.name}`.replace(/\s/g, '-').toLowerCase() },
            update: {},
            create: {
                motelId: motel.id,
                ...room,
                deposit: room.price,
                maxTenants: room.roomType === 'SINGLE' ? 2 : room.roomType === 'FAMILY' ? 6 : 3,
                description: `${room.name} - ${room.area}m², ${room.roomType.toLowerCase()}`,
            },
        });
    }
    console.log(`✅ Created ${rooms.length} rooms`);

    // Create tenant user
    const tenantPassword = await bcrypt.hash('Tenant@123', 12);
    const tenant = await prisma.user.upsert({
        where: { email: 'tenant@nhatro.vn' },
        update: {},
        create: {
            email: 'tenant@nhatro.vn',
            password: tenantPassword,
            fullName: 'Trần Văn Thuê',
            role: 'TENANT',
            phone: '0901234569',
            emailVerified: true,
        },
    });
    console.log(`✅ Created tenant: ${tenant.email}`);

    console.log('\n🎉 Seeding completed!');
    console.log('\n📋 Test accounts:');
    console.log('   Admin:    admin@nhatro.vn / Admin@123');
    console.log('   Landlord: landlord@nhatro.vn / Landlord@123');
    console.log('   Tenant:   tenant@nhatro.vn / Tenant@123');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
