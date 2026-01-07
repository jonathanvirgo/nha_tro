"use client";

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams as useNextSearchParams } from 'next/navigation';
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
} from 'lucide-react';
import { mockRooms, districts, amenitiesList } from '@/data/mockData';
import { RoomCard } from '@/components/room/RoomCard';
import { Badge } from '@/components/ui/badge';

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

    const formatPrice = (price: number) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)}tr`;
        }
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const filteredRooms = useMemo(() => {
        let rooms = [...mockRooms];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            rooms = rooms.filter(
                (room) =>
                    room.name.toLowerCase().includes(query) ||
                    room.address.toLowerCase().includes(query) ||
                    room.propertyName.toLowerCase().includes(query)
            );
        }

        if (selectedDistrict) {
            rooms = rooms.filter((room) => room.district === selectedDistrict);
        }

        rooms = rooms.filter(
            (room) => room.price >= priceRange[0] && room.price <= priceRange[1]
        );

        rooms = rooms.filter(
            (room) => room.area >= areaRange[0] && room.area <= areaRange[1]
        );

        if (selectedAmenities.length > 0) {
            rooms = rooms.filter((room) =>
                selectedAmenities.every((amenity) => room.amenities.includes(amenity))
            );
        }

        switch (sortBy) {
            case 'price-asc':
                rooms.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                rooms.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                rooms.sort((a, b) => b.rating - a.rating);
                break;
            case 'area':
                rooms.sort((a, b) => b.area - a.area);
                break;
            case 'newest':
            default:
                rooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        return rooms;
    }, [searchQuery, selectedDistrict, priceRange, areaRange, selectedAmenities, sortBy]);

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
                                    Tìm thấy <strong className="text-foreground">{filteredRooms.length}</strong> phòng
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
                        {filteredRooms.length === 0 ? (
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
                                {filteredRooms.map((room, index) => (
                                    <RoomCard key={room.id} room={room} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredRooms.map((room, index) => (
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
