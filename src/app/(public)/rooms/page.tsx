"use client";

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams as useNextSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import {
    Search,
    SlidersHorizontal,
    Grid3X3,
    List,
    MapPin,
    X,
    Loader2,
} from 'lucide-react';
import { RoomCard } from '@/components/room/RoomCard';
import { Badge } from '@/components/ui/badge';

// Static data for districts and amenities (không thay đổi thường xuyên)
const districts = [
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
    'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
    'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Gò Vấp',
    'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Thủ Đức',
];

const amenitiesList = [
    'Wifi miễn phí', 'Điều hòa', 'Tủ lạnh', 'Máy giặt',
    'WC riêng', 'Ban công', 'Bếp riêng', 'Giường',
    'Tủ quần áo', 'Bàn làm việc', 'Thang máy', 'Bãi đỗ xe',
];

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'area';

function RoomsPageContent() {
    const searchParams = useNextSearchParams();
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || '');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
    const [areaRange, setAreaRange] = useState<[number, number]>([0, 50]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Fetch rooms từ API
    const { data: response, isLoading } = useQuery({
        queryKey: ['search-rooms', searchQuery, selectedDistrict, priceRange, areaRange],
        queryFn: () => {
            const params: Record<string, string> = {};
            if (searchQuery) params.keyword = searchQuery;
            if (selectedDistrict) params.district = selectedDistrict;
            if (priceRange[0] > 0) params.minPrice = String(priceRange[0]);
            if (priceRange[1] < 10000000) params.maxPrice = String(priceRange[1]);
            if (areaRange[0] > 0) params.minArea = String(areaRange[0]);
            if (areaRange[1] < 50) params.maxArea = String(areaRange[1]);
            return api.searchRooms(params);
        },
        staleTime: 30000, // Cache for 30 seconds
    });

    const rooms = response?.data || [];

    const formatPrice = (price: number) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)}tr`;
        }
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const filteredRooms = useMemo(() => {
        let result = Array.isArray(rooms) ? [...rooms] : [];

        // Filter by amenities (client-side since API might not support)
        if (selectedAmenities.length > 0) {
            result = result.filter((room: any) =>
                selectedAmenities.every((amenity) => room.amenities?.includes(amenity) || room.utilities?.some((u: any) => u.name === amenity))
            );
        }

        // Sort
        switch (sortBy) {
            case 'price-asc':
                result.sort((a: any, b: any) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a: any, b: any) => b.price - a.price);
                break;
            case 'rating':
                result.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'area':
                result.sort((a: any, b: any) => b.area - a.area);
                break;
            case 'newest':
            default:
                result.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        }

        return result;
    }, [rooms, selectedAmenities, sortBy]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (selectedDistrict) count++;
        if (priceRange[0] > 0 || priceRange[1] < 10000000) count++;
        if (areaRange[0] > 0 || areaRange[1] < 50) count++;
        if (selectedAmenities.length > 0) count++;
        return count;
    }, [selectedDistrict, priceRange, areaRange, selectedAmenities]);

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedDistrict('');
        setPriceRange([0, 10000000]);
        setAreaRange([0, 50]);
        setSelectedAmenities([]);
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const FilterContent = () => (
        <div className="space-y-6">
            <div className="space-y-3">
                <Label className="text-base font-semibold">Quận/Huyện</Label>
                <Select value={selectedDistrict || "all"} onValueChange={(val) => setSelectedDistrict(val === "all" ? "" : val)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn quận/huyện" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {districts.map((district) => (
                            <SelectItem key={district} value={district}>
                                {district}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Mức giá</Label>
                    <span className="text-sm text-muted-foreground">
                        {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    </span>
                </div>
                <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    min={0}
                    max={10000000}
                    step={500000}
                    className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0đ</span>
                    <span>10tr+</span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Diện tích</Label>
                    <span className="text-sm text-muted-foreground">
                        {areaRange[0]}m² - {areaRange[1]}m²
                    </span>
                </div>
                <Slider
                    value={areaRange}
                    onValueChange={(value) => setAreaRange(value as [number, number])}
                    min={0}
                    max={50}
                    step={5}
                    className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0m²</span>
                    <span>50m²+</span>
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-base font-semibold">Tiện nghi</Label>
                <div className="grid grid-cols-2 gap-2">
                    {amenitiesList.slice(0, 12).map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                                id={amenity}
                                checked={selectedAmenities.includes(amenity)}
                                onCheckedChange={() => toggleAmenity(amenity)}
                            />
                            <label
                                htmlFor={amenity}
                                className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {amenity}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {activeFiltersCount > 0 && (
                <Button variant="outline" onClick={clearAllFilters} className="w-full">
                    <X className="mr-2 h-4 w-4" />
                    Xóa bộ lọc ({activeFiltersCount})
                </Button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b bg-card/50 backdrop-blur sticky top-16 z-40">
                <div className="container py-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Tìm theo tên, địa chỉ..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="lg:hidden shrink-0">
                                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                                        Lọc
                                        {activeFiltersCount > 0 && (
                                            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                                                {activeFiltersCount}
                                            </Badge>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-80 overflow-y-auto">
                                    <SheetHeader>
                                        <SheetTitle>Bộ lọc tìm kiếm</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-6">
                                        <FilterContent />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>
                                    {isLoading ? 'Đang tải...' : (
                                        <>Tìm thấy <strong className="text-foreground">{filteredRooms.length}</strong> phòng</>
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="Sắp xếp" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Mới nhất</SelectItem>
                                        <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                                        <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                                        <SelectItem value="rating">Đánh giá cao</SelectItem>
                                        <SelectItem value="area">Diện tích lớn</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="hidden sm:flex items-center border rounded-lg overflow-hidden">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="icon"
                                        className="rounded-none h-9 w-9"
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="icon"
                                        className="rounded-none h-9 w-9"
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {activeFiltersCount > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedDistrict && (
                                    <Badge variant="secondary" className="gap-1">
                                        {selectedDistrict}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => setSelectedDistrict('')}
                                        />
                                    </Badge>
                                )}
                                {(priceRange[0] > 0 || priceRange[1] < 10000000) && (
                                    <Badge variant="secondary" className="gap-1">
                                        {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => setPriceRange([0, 10000000])}
                                        />
                                    </Badge>
                                )}
                                {selectedAmenities.map((amenity) => (
                                    <Badge key={amenity} variant="secondary" className="gap-1">
                                        {amenity}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => toggleAmenity(amenity)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container py-6">
                <div className="flex gap-6">
                    <aside className="hidden lg:block w-72 shrink-0">
                        <div className="sticky top-40 bg-card rounded-xl border p-6">
                            <h3 className="font-semibold text-lg mb-4">Bộ lọc</h3>
                            <FilterContent />
                        </div>
                    </aside>

                    <div className="flex-1">
                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : filteredRooms.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                    <Search className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Không tìm thấy phòng nào</h3>
                                <p className="text-muted-foreground mb-4">
                                    Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                                </p>
                                <Button variant="outline" onClick={clearAllFilters}>
                                    Xóa tất cả bộ lọc
                                </Button>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredRooms.map((room: any, index: number) => (
                                    <RoomCard key={room.id} room={room} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredRooms.map((room: any, index: number) => (
                                    <RoomCard key={room.id} room={room} index={index} variant="horizontal" />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RoomsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
            <RoomsPageContent />
        </Suspense>
    );
}
