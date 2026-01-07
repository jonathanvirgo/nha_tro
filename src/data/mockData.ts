// Mock data for PhongTro - Room Rental Platform

export interface Property {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  description: string;
  totalRooms: number;
  availableRooms: number;
  amenities: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerAvatar: string;
  latitude: number;
  longitude: number;
}

export interface Room {
  id: string;
  propertyId: string;
  propertyName: string;
  name: string;
  price: number;
  deposit: number;
  area: number;
  floor: number;
  maxOccupants: number;
  description: string;
  amenities: string[];
  utilities: {
    electricity: number;
    water: number;
    internet: number;
    parking: number;
  };
  images: string[];
  isAvailable: boolean;
  address: string;
  district: string;
  city: string;
  rating: number;
  reviewCount: number;
  ownerName: string;
  ownerPhone: string;
  ownerAvatar: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface Review {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  propertyName: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

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

export const amenitiesList = [
  'Wifi miễn phí',
  'Điều hòa',
  'Máy giặt',
  'Tủ lạnh',
  'Bếp riêng',
  'WC riêng',
  'Ban công',
  'Giường',
  'Tủ quần áo',
  'Bàn làm việc',
  'Bãi đỗ xe',
  'Camera an ninh',
  'Bảo vệ 24/7',
  'Thang máy',
  'Cho nuôi thú cưng',
];

export const districts = [
  'Quận 1',
  'Quận 2',
  'Quận 3',
  'Quận 4',
  'Quận 5',
  'Quận 7',
  'Quận 10',
  'Bình Thạnh',
  'Gò Vấp',
  'Tân Bình',
  'Phú Nhuận',
  'Thủ Đức',
];

// Mock Properties/Buildings data
export const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Nhà Trọ Minh Tâm',
    address: '123 Nguyễn Văn Cừ, Phường 4',
    district: 'Quận 5',
    city: 'TP. Hồ Chí Minh',
    description: 'Nhà trọ cao cấp với đầy đủ tiện nghi, an ninh 24/7, gần trung tâm thành phố.',
    totalRooms: 12,
    availableRooms: 4,
    amenities: ['Wifi miễn phí', 'Điều hòa', 'Bảo vệ 24/7', 'Camera an ninh', 'Bãi đỗ xe'],
    images: [roomImages[0], roomImages[1], roomImages[2]],
    rating: 4.7,
    reviewCount: 42,
    ownerId: 'owner1',
    ownerName: 'Nguyễn Minh Tâm',
    ownerPhone: '0901234567',
    ownerAvatar: avatars[0],
    latitude: 10.7623,
    longitude: 106.6827,
  },
  {
    id: '2',
    name: 'Căn Hộ Mini Sunshine',
    address: '456 Điện Biên Phủ, Phường 21',
    district: 'Bình Thạnh',
    city: 'TP. Hồ Chí Minh',
    description: 'Căn hộ mini full nội thất cao cấp, view công viên, thang máy, bảo vệ 24/7.',
    totalRooms: 20,
    availableRooms: 6,
    amenities: ['Wifi miễn phí', 'Điều hòa', 'Thang máy', 'Máy giặt', 'Bếp riêng'],
    images: [roomImages[1], roomImages[0], roomImages[4]],
    rating: 4.9,
    reviewCount: 67,
    ownerId: 'owner2',
    ownerName: 'Trần Thị Hương',
    ownerPhone: '0912345678',
    ownerAvatar: avatars[1],
    latitude: 10.8031,
    longitude: 106.7144,
  },
  {
    id: '3',
    name: 'KTX Sinh Viên Thành Công',
    address: '789 Lý Thường Kiệt, Phường 14',
    district: 'Quận 10',
    city: 'TP. Hồ Chí Minh',
    description: 'Ký túc xá sinh viên giá rẻ, môi trường học tập tốt, gần các trường đại học.',
    totalRooms: 50,
    availableRooms: 15,
    amenities: ['Wifi miễn phí', 'Điều hòa', 'Bảo vệ 24/7', 'Canteen'],
    images: [roomImages[4], roomImages[5], roomImages[0]],
    rating: 4.2,
    reviewCount: 120,
    ownerId: 'owner3',
    ownerName: 'Lê Văn Thành',
    ownerPhone: '0923456789',
    ownerAvatar: avatars[2],
    latitude: 10.7726,
    longitude: 106.6602,
  },
  {
    id: '4',
    name: 'Nhà Trọ An Phú',
    address: '101 Nguyễn Hữu Cảnh, Phường 22',
    district: 'Bình Thạnh',
    city: 'TP. Hồ Chí Minh',
    description: 'Nhà trọ cao cấp view sông, nội thất sang trọng, dịch vụ 5 sao.',
    totalRooms: 8,
    availableRooms: 2,
    amenities: ['Wifi miễn phí', 'Điều hòa', 'Thang máy', 'Bảo vệ 24/7', 'Hồ bơi'],
    images: [roomImages[5], roomImages[1], roomImages[2]],
    rating: 5.0,
    reviewCount: 28,
    ownerId: 'owner4',
    ownerName: 'Phạm Anh Dũng',
    ownerPhone: '0934567890',
    ownerAvatar: avatars[3],
    latitude: 10.7944,
    longitude: 106.7216,
  },
  {
    id: '5',
    name: 'Nhà Trọ Hoa Mai',
    address: '222 Lý Thường Kiệt, Phường 15',
    district: 'Quận 10',
    city: 'TP. Hồ Chí Minh',
    description: 'Nhà trọ yên tĩnh gần ĐH Bách Khoa, phù hợp cho sinh viên.',
    totalRooms: 15,
    availableRooms: 5,
    amenities: ['Wifi miễn phí', 'Điều hòa', 'Bãi đỗ xe', 'Bảo vệ'],
    images: [roomImages[0], roomImages[3], roomImages[4]],
    rating: 4.6,
    reviewCount: 45,
    ownerId: 'owner5',
    ownerName: 'Nguyễn Thị Mai',
    ownerPhone: '0945678901',
    ownerAvatar: avatars[1],
    latitude: 10.7731,
    longitude: 106.6580,
  },
  {
    id: '6',
    name: 'Chung Cư Mini Phú Mỹ',
    address: '333 Nguyễn Xí, Phường 26',
    district: 'Bình Thạnh',
    city: 'TP. Hồ Chí Minh',
    description: 'Chung cư mini hiện đại, cho phép nuôi thú cưng, có sân vườn.',
    totalRooms: 24,
    availableRooms: 8,
    amenities: ['Wifi miễn phí', 'Điều hòa', 'Thang máy', 'Cho nuôi thú cưng', 'Sân vườn'],
    images: [roomImages[2], roomImages[0], roomImages[1]],
    rating: 4.7,
    reviewCount: 38,
    ownerId: 'owner6',
    ownerName: 'Võ Minh Tuấn',
    ownerPhone: '0956789012',
    ownerAvatar: avatars[0],
    latitude: 10.8124,
    longitude: 106.7089,
  },
  {
    id: '7',
    name: 'Nhà Trọ Tân Phú',
    address: '55 Âu Cơ, Phường 9',
    district: 'Tân Bình',
    city: 'TP. Hồ Chí Minh',
    description: 'Nhà trọ giá rẻ gần sân bay, thuận tiện di chuyển.',
    totalRooms: 18,
    availableRooms: 7,
    amenities: ['Wifi miễn phí', 'Điều hòa', 'Bãi đỗ xe'],
    images: [roomImages[3], roomImages[2], roomImages[5]],
    rating: 4.3,
    reviewCount: 52,
    ownerId: 'owner7',
    ownerName: 'Trần Văn Phú',
    ownerPhone: '0967890123',
    ownerAvatar: avatars[2],
    latitude: 10.8102,
    longitude: 106.6285,
  },
  {
    id: '8',
    name: 'Căn Hộ Dịch Vụ Gò Vấp',
    address: '77 Phan Văn Trị, Phường 7',
    district: 'Gò Vấp',
    city: 'TP. Hồ Chí Minh',
    description: 'Căn hộ dịch vụ full nội thất, dọn phòng hàng tuần.',
    totalRooms: 30,
    availableRooms: 10,
    amenities: ['Wifi miễn phí', 'Điều hòa', 'Dọn phòng', 'Giặt ủi', 'Thang máy'],
    images: [roomImages[1], roomImages[4], roomImages[0]],
    rating: 4.5,
    reviewCount: 73,
    ownerId: 'owner8',
    ownerName: 'Lê Thị Nga',
    ownerPhone: '0978901234',
    ownerAvatar: avatars[1],
    latitude: 10.8388,
    longitude: 106.6732,
  },
  {
    id: '9',
    name: 'Nhà Trọ Phú Nhuận Central',
    address: '99 Phan Xích Long, Phường 2',
    district: 'Phú Nhuận',
    city: 'TP. Hồ Chí Minh',
    description: 'Nhà trọ trung tâm Phú Nhuận, gần chợ và siêu thị.',
    totalRooms: 10,
    availableRooms: 3,
    amenities: ['Wifi miễn phí', 'Điều hòa', 'WC riêng', 'Bếp chung'],
    images: [roomImages[5], roomImages[3], roomImages[1]],
    rating: 4.4,
    reviewCount: 35,
    ownerId: 'owner9',
    ownerName: 'Hoàng Văn Long',
    ownerPhone: '0989012345',
    ownerAvatar: avatars[3],
    latitude: 10.7989,
    longitude: 106.6821,
  },
  {
    id: '10',
    name: 'Ký Túc Xá Thủ Đức',
    address: '188 Võ Văn Ngân, Phường Linh Chiểu',
    district: 'Thủ Đức',
    city: 'TP. Hồ Chí Minh',
    description: 'KTX sinh viên gần làng đại học, giá siêu rẻ.',
    totalRooms: 100,
    availableRooms: 25,
    amenities: ['Wifi miễn phí', 'Điều hòa', 'Canteen', 'Sân thể thao'],
    images: [roomImages[4], roomImages[2], roomImages[0]],
    rating: 4.1,
    reviewCount: 156,
    ownerId: 'owner10',
    ownerName: 'Nguyễn Thành Đạt',
    ownerPhone: '0990123456',
    ownerAvatar: avatars[0],
    latitude: 10.8505,
    longitude: 106.7720,
  },
];

export const mockRooms: Room[] = [
  {
    id: '1',
    propertyId: '1',
    propertyName: 'Nhà Trọ Minh Tâm',
    name: 'Phòng 101 - Studio cao cấp',
    price: 4500000,
    deposit: 9000000,
    area: 25,
    floor: 1,
    maxOccupants: 2,
    description: 'Phòng studio cao cấp với đầy đủ tiện nghi, view đẹp, gần trung tâm. Thích hợp cho sinh viên hoặc nhân viên văn phòng.',
    amenities: ['Wifi miễn phí', 'Điều hòa', 'Tủ lạnh', 'WC riêng', 'Ban công', 'Giường', 'Tủ quần áo'],
    utilities: { electricity: 3500, water: 100000, internet: 0, parking: 200000 },
    images: [roomImages[0], roomImages[1], roomImages[2]],
    isAvailable: true,
    address: '123 Nguyễn Văn Cừ',
    district: 'Quận 5',
    city: 'TP. Hồ Chí Minh',
    rating: 4.8,
    reviewCount: 24,
    ownerName: 'Nguyễn Minh Tâm',
    ownerPhone: '0901234567',
    ownerAvatar: avatars[0],
    latitude: 10.7623,
    longitude: 106.6827,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    propertyId: '1',
    propertyName: 'Nhà Trọ Minh Tâm',
    name: 'Phòng 202 - Phòng đôi rộng rãi',
    price: 3800000,
    deposit: 7600000,
    area: 20,
    floor: 2,
    maxOccupants: 2,
    description: 'Phòng đôi thoáng mát, có cửa sổ lớn, an ninh tốt. Gần chợ và siêu thị tiện lợi.',
    amenities: ['Wifi miễn phí', 'Điều hòa', 'WC riêng', 'Giường', 'Tủ quần áo', 'Bàn làm việc'],
    utilities: { electricity: 3500, water: 80000, internet: 100000, parking: 150000 },
    images: [roomImages[3], roomImages[4], roomImages[5]],
    isAvailable: true,
    address: '123 Nguyễn Văn Cừ',
    district: 'Quận 5',
    city: 'TP. Hồ Chí Minh',
    rating: 4.5,
    reviewCount: 18,
    ownerName: 'Nguyễn Minh Tâm',
    ownerPhone: '0901234567',
    ownerAvatar: avatars[0],
    latitude: 10.7623,
    longitude: 106.6827,
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    propertyId: '2',
    propertyName: 'Căn Hộ Mini Sunshine',
    name: 'Studio A1 - Full nội thất',
    price: 5200000,
    deposit: 10400000,
    area: 30,
    floor: 3,
    maxOccupants: 2,
    description: 'Căn hộ mini full nội thất cao cấp, có bếp riêng, view công viên. Phù hợp cho cặp đôi hoặc người đi làm.',
    amenities: ['Wifi miễn phí', 'Điều hòa', 'Máy giặt', 'Tủ lạnh', 'Bếp riêng', 'WC riêng', 'Ban công', 'Thang máy'],
    utilities: { electricity: 3500, water: 120000, internet: 0, parking: 300000 },
    images: [roomImages[1], roomImages[0], roomImages[4]],
    isAvailable: true,
    address: '456 Điện Biên Phủ',
    district: 'Bình Thạnh',
    city: 'TP. Hồ Chí Minh',
    rating: 4.9,
    reviewCount: 42,
    ownerName: 'Trần Thị Hương',
    ownerPhone: '0912345678',
    ownerAvatar: avatars[1],
    latitude: 10.8031,
    longitude: 106.7144,
    createdAt: '2024-02-01',
  },
  {
    id: '4',
    propertyId: '2',
    propertyName: 'Căn Hộ Mini Sunshine',
    name: 'Studio B2 - Giá tốt',
    price: 4000000,
    deposit: 8000000,
    area: 22,
    floor: 2,
    maxOccupants: 2,
    description: 'Căn hộ mini giá hợp lý, đầy đủ tiện nghi cơ bản. Gần trạm xe buýt và trường đại học.',
    amenities: ['Wifi miễn phí', 'Điều hòa', 'Tủ lạnh', 'WC riêng', 'Giường', 'Thang máy'],
    utilities: { electricity: 3500, water: 100000, internet: 0, parking: 200000 },
    images: [roomImages[2], roomImages[3], roomImages[5]],
    isAvailable: true,
    address: '456 Điện Biên Phủ',
    district: 'Bình Thạnh',
    city: 'TP. Hồ Chí Minh',
    rating: 4.3,
    reviewCount: 15,
    ownerName: 'Trần Thị Hương',
    ownerPhone: '0912345678',
    ownerAvatar: avatars[1],
    latitude: 10.8031,
    longitude: 106.7144,
    createdAt: '2024-02-05',
  },
  {
    id: '5',
    propertyId: '3',
    propertyName: 'KTX Sinh Viên Thành Công',
    name: 'Phòng KTX 4 người - Nam',
    price: 1500000,
    deposit: 3000000,
    area: 28,
    floor: 1,
    maxOccupants: 4,
    description: 'Phòng ký túc xá 4 giường tầng, dành cho nam. Môi trường học tập tốt, gần các trường đại học lớn.',
    amenities: ['Wifi miễn phí', 'Điều hòa', 'WC chung', 'Giường', 'Tủ quần áo', 'Bàn làm việc', 'Bảo vệ 24/7'],
    utilities: { electricity: 0, water: 0, internet: 0, parking: 50000 },
    images: [roomImages[4], roomImages[5], roomImages[0]],
    isAvailable: true,
    address: '789 Lý Thường Kiệt',
    district: 'Quận 10',
    city: 'TP. Hồ Chí Minh',
    rating: 4.2,
    reviewCount: 56,
    ownerName: 'Lê Văn Thành',
    ownerPhone: '0923456789',
    ownerAvatar: avatars[2],
    latitude: 10.7726,
    longitude: 106.6602,
    createdAt: '2024-01-10',
  },
  {
    id: '6',
    propertyId: '4',
    propertyName: 'Nhà Trọ An Phú',
    name: 'Phòng VIP - Penthouse view sông',
    price: 8500000,
    deposit: 17000000,
    area: 45,
    floor: 10,
    maxOccupants: 2,
    description: 'Phòng penthouse cao cấp với view sông tuyệt đẹp. Nội thất sang trọng, dịch vụ 5 sao. Thích hợp cho người có thu nhập cao.',
    amenities: ['Wifi miễn phí', 'Điều hòa', 'Máy giặt', 'Tủ lạnh', 'Bếp riêng', 'WC riêng', 'Ban công', 'Thang máy', 'Bảo vệ 24/7', 'Camera an ninh'],
    utilities: { electricity: 3500, water: 150000, internet: 0, parking: 0 },
    images: [roomImages[5], roomImages[1], roomImages[2]],
    isAvailable: true,
    address: '101 Nguyễn Hữu Cảnh',
    district: 'Bình Thạnh',
    city: 'TP. Hồ Chí Minh',
    rating: 5.0,
    reviewCount: 8,
    ownerName: 'Phạm Anh Dũng',
    ownerPhone: '0934567890',
    ownerAvatar: avatars[3],
    latitude: 10.7944,
    longitude: 106.7216,
    createdAt: '2024-02-10',
  },
  {
    id: '7',
    propertyId: '5',
    propertyName: 'Nhà Trọ Hoa Mai',
    name: 'Phòng 301 - Gần ĐH Bách Khoa',
    price: 2800000,
    deposit: 5600000,
    area: 18,
    floor: 3,
    maxOccupants: 1,
    description: 'Phòng đơn sạch sẽ, yên tĩnh. Đi bộ 5 phút đến ĐH Bách Khoa. Phù hợp cho sinh viên.',
    amenities: ['Wifi miễn phí', 'Điều hòa', 'WC riêng', 'Giường', 'Bàn làm việc'],
    utilities: { electricity: 3500, water: 70000, internet: 50000, parking: 100000 },
    images: [roomImages[0], roomImages[3], roomImages[4]],
    isAvailable: true,
    address: '222 Lý Thường Kiệt',
    district: 'Quận 10',
    city: 'TP. Hồ Chí Minh',
    rating: 4.6,
    reviewCount: 31,
    ownerName: 'Nguyễn Thị Mai',
    ownerPhone: '0945678901',
    ownerAvatar: avatars[1],
    latitude: 10.7731,
    longitude: 106.6580,
    createdAt: '2024-01-25',
  },
  {
    id: '8',
    propertyId: '6',
    propertyName: 'Chung Cư Mini Phú Mỹ',
    name: 'Căn 1PN - Tầng trệt',
    price: 6000000,
    deposit: 12000000,
    area: 35,
    floor: 1,
    maxOccupants: 2,
    description: 'Căn hộ 1 phòng ngủ tầng trệt, tiện lợi cho người già hoặc gia đình có trẻ nhỏ. Có sân vườn riêng.',
    amenities: ['Wifi miễn phí', 'Điều hòa', 'Máy giặt', 'Tủ lạnh', 'Bếp riêng', 'WC riêng', 'Cho nuôi thú cưng', 'Bãi đỗ xe'],
    utilities: { electricity: 3500, water: 130000, internet: 0, parking: 0 },
    images: [roomImages[2], roomImages[0], roomImages[1]],
    isAvailable: true,
    address: '333 Nguyễn Xí',
    district: 'Bình Thạnh',
    city: 'TP. Hồ Chí Minh',
    rating: 4.7,
    reviewCount: 19,
    ownerName: 'Võ Minh Tuấn',
    ownerPhone: '0956789012',
    ownerAvatar: avatars[0],
    latitude: 10.8124,
    longitude: 106.7089,
    createdAt: '2024-02-15',
  },
];

export const mockReviews: Review[] = [
  {
    id: '1',
    roomId: '1',
    userId: 'user1',
    userName: 'Trần Văn An',
    userAvatar: avatars[2],
    rating: 5,
    comment: 'Phòng rất đẹp và sạch sẽ, chủ nhà thân thiện. Đã ở đây 6 tháng rất hài lòng!',
    createdAt: '2024-02-20',
  },
  {
    id: '2',
    roomId: '1',
    userId: 'user2',
    userName: 'Lê Thị Bình',
    userAvatar: avatars[1],
    rating: 4,
    comment: 'Vị trí thuận tiện, giá cả hợp lý. Chỉ hơi ồn vào cuối tuần.',
    createdAt: '2024-02-15',
  },
  {
    id: '3',
    roomId: '3',
    userId: 'user3',
    userName: 'Nguyễn Hoàng Nam',
    userAvatar: avatars[3],
    rating: 5,
    comment: 'Căn hộ tuyệt vời, đầy đủ tiện nghi. View công viên rất đẹp!',
    createdAt: '2024-02-18',
  },
];

export const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Nguyễn Văn Hùng',
    role: 'Sinh viên ĐH Bách Khoa',
    avatar: avatars[2],
    content: 'Tìm được phòng trọ ưng ý chỉ trong 2 ngày nhờ PhòngTrọ. Giao diện dễ sử dụng, thông tin chi tiết. Rất recommend!',
    rating: 5,
  },
  {
    id: '2',
    name: 'Trần Thị Lan',
    role: 'Nhân viên văn phòng',
    avatar: avatars[1],
    content: 'Đặt lịch xem phòng online rất tiện lợi, không cần gọi điện nhiều. Tiết kiệm thời gian đi lại rất nhiều.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Phạm Minh Đức',
    role: 'Chủ nhà trọ',
    avatar: avatars[0],
    content: 'Quản lý nhà trọ dễ dàng hơn rất nhiều. Thu tiền, quản lý hợp đồng, tất cả đều tự động. Tuyệt vời!',
    rating: 5,
  },
  {
    id: '4',
    name: 'Lê Hoàng Anh',
    role: 'Freelancer',
    avatar: avatars[3],
    content: 'Bản đồ tìm phòng giúp tôi tìm được chỗ ở gần quán cafe yêu thích. Rất tiện cho người làm việc tự do!',
    rating: 4,
  },
];

export const statistics = {
  totalRooms: 15000,
  totalUsers: 50000,
  totalBookings: 120000,
  cities: 20,
};
