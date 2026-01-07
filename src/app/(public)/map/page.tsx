"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    MapPin,
    Search,
    List,
    X,
    Star,
    Locate,
    Navigation,
    Route,
} from 'lucide-react';
import { mockProperties, mockRooms, districts, Property } from '@/data/mockData';

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const getPropertyMinPrice = (propertyId: string): number => {
    const propertyRooms = mockRooms.filter(room => room.propertyId === propertyId && room.isAvailable);
    if (propertyRooms.length === 0) return 0;
    return Math.min(...propertyRooms.map(room => room.price));
};

const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}tr`;
    return new Intl.NumberFormat('vi-VN').format(price);
};

function MapPageContent() {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const circleRef = useRef<L.Circle | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const LRef = useRef<typeof import('leaflet') | null>(null);

    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [isListOpen, setIsListOpen] = useState(false);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [searchRadius, setSearchRadius] = useState(20);
    const [isLocating, setIsLocating] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);

    const filteredProperties = useMemo(() => mockProperties.filter((property) => {
        const matchesSearch = !searchQuery ||
            property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDistrict = !selectedDistrict || selectedDistrict === 'all' || property.district === selectedDistrict;

        let withinRadius = true;
        if (userLocation) {
            const distance = calculateDistance(userLocation[0], userLocation[1], property.latitude, property.longitude);
            withinRadius = distance <= searchRadius;
        }

        return matchesSearch && matchesDistrict && withinRadius;
    }), [searchQuery, selectedDistrict, userLocation, searchRadius]);

    const getUserLocation = () => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setIsLocating(false);
                    if (mapRef.current) {
                        mapRef.current.flyTo([latitude, longitude], 14);
                    }
                },
                () => {
                    setIsLocating(false);
                    alert('Không thể lấy vị trí của bạn. Vui lòng cho phép truy cập vị trí.');
                }
            );
        } else {
            setIsLocating(false);
            alert('Trình duyệt không hỗ trợ định vị.');
        }
    };

    const clearUserLocation = () => {
        setUserLocation(null);
        if (circleRef.current) {
            circleRef.current.remove();
            circleRef.current = null;
        }
        if (userMarkerRef.current) {
            userMarkerRef.current.remove();
            userMarkerRef.current = null;
        }
    };

    // Initialize map
    useEffect(() => {
        if (typeof window === 'undefined' || !mapContainerRef.current || mapRef.current) return;

        const initMap = async () => {
            const L = await import('leaflet');
            LRef.current = L;

            // Fix for default marker icons
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            const defaultCenter: [number, number] = [10.7769, 106.6927];
            mapRef.current = L.map(mapContainerRef.current!).setView(defaultCenter, 12);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(mapRef.current);

            setIsMapReady(true);
        };

        initMap();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update user location marker
    useEffect(() => {
        if (!mapRef.current || !LRef.current || !isMapReady) return;
        const L = LRef.current;

        if (userMarkerRef.current) userMarkerRef.current.remove();
        if (circleRef.current) circleRef.current.remove();

        if (userLocation) {
            const userIcon = L.divIcon({
                className: 'user-location-marker',
                html: `<div style="width:20px;height:20px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
            });

            userMarkerRef.current = L.marker(userLocation, { icon: userIcon })
                .addTo(mapRef.current)
                .bindPopup('Vị trí của bạn');

            circleRef.current = L.circle(userLocation, {
                radius: searchRadius * 1000,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2,
            }).addTo(mapRef.current);
        }
    }, [userLocation, searchRadius, isMapReady]);

    // Update property markers
    useEffect(() => {
        if (!mapRef.current || !LRef.current || !isMapReady) return;
        const L = LRef.current;

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        filteredProperties.forEach((property) => {
            const minPrice = getPropertyMinPrice(property.id);
            const isSelected = selectedProperty?.id === property.id;

            const buildingIcon = L.divIcon({
                className: 'custom-building-marker',
                html: `
                    <div style="filter:drop-shadow(0 4px 6px rgba(0,0,0,0.25));cursor:pointer;">
                        <div style="background:${isSelected ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)'};color:white;padding:8px 12px;border-radius:12px 12px 12px 2px;font-size:12px;font-weight:700;display:flex;align-items:center;gap:8px;border:2px solid rgba(255,255,255,0.3);">
                            <span>${minPrice > 0 ? formatPrice(minPrice) + 'đ' : property.availableRooms + ' phòng'}</span>
                        </div>
                        <div style="position:absolute;top:-8px;right:-8px;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:white;font-size:10px;font-weight:700;padding:3px 6px;border-radius:10px;border:2px solid white;">★${property.rating}</div>
                    </div>
                `,
                iconSize: [120, 50],
                iconAnchor: [60, 50],
            });

            const marker = L.marker([property.latitude, property.longitude], { icon: buildingIcon })
                .addTo(mapRef.current!);

            marker.on('click', () => {
                setSelectedProperty(property);
                mapRef.current?.flyTo([property.latitude, property.longitude], 16, { duration: 1 });
            });

            markersRef.current.push(marker);
        });
    }, [filteredProperties, selectedProperty, isMapReady]);

    const handlePropertyClick = (property: Property) => {
        setSelectedProperty(property);
        setIsListOpen(false);
    };

    return (
        <div className="relative h-[calc(100vh-4rem)]">
            <div ref={mapContainerRef} className="absolute inset-0 z-0" />

            {/* Search Bar */}
            <div className="absolute top-4 left-4 right-4 md:left-4 md:right-auto md:w-[400px] z-[1000]">
                <Card className="shadow-lg">
                    <CardContent className="p-3 space-y-3">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Tìm kiếm tòa nhà..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Quận" />
                                </SelectTrigger>
                                <SelectContent className="z-[1100]">
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    {districts.map((d) => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant={userLocation ? "default" : "outline"}
                                size="sm"
                                onClick={userLocation ? clearUserLocation : getUserLocation}
                                disabled={isLocating}
                            >
                                {isLocating ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : userLocation ? (
                                    <><X className="h-4 w-4 mr-1" />Xóa vị trí</>
                                ) : (
                                    <><Locate className="h-4 w-4 mr-1" />Vị trí của tôi</>
                                )}
                            </Button>

                            {userLocation && (
                                <div className="flex-1 flex items-center gap-2">
                                    <Navigation className="h-4 w-4 text-muted-foreground" />
                                    <Slider
                                        value={[searchRadius]}
                                        onValueChange={(value) => setSearchRadius(value[0])}
                                        min={1}
                                        max={30}
                                        step={1}
                                        className="flex-1"
                                    />
                                    <span className="text-sm font-medium w-12 text-right">{searchRadius}km</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Tìm thấy <strong>{filteredProperties.length}</strong> tòa nhà
                                {userLocation && <span className="text-primary ml-1">trong {searchRadius}km</span>}
                            </span>
                            <Sheet open={isListOpen} onOpenChange={setIsListOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <List className="h-4 w-4 mr-2" />Danh sách
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-full sm:w-96 overflow-y-auto z-[1001]">
                                    <SheetHeader>
                                        <SheetTitle>Danh sách ({filteredProperties.length})</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-4 space-y-3">
                                        {filteredProperties.map((property) => {
                                            const distance = userLocation
                                                ? calculateDistance(userLocation[0], userLocation[1], property.latitude, property.longitude)
                                                : null;
                                            const minPrice = getPropertyMinPrice(property.id);

                                            return (
                                                <Card key={property.id} className="cursor-pointer hover:border-primary/50" onClick={() => handlePropertyClick(property)}>
                                                    <CardContent className="p-3">
                                                        <div className="flex gap-3">
                                                            <img src={property.images[0]} alt={property.name} className="w-20 h-20 rounded-lg object-cover" />
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-sm line-clamp-1">{property.name}</h4>
                                                                <p className="text-xs text-muted-foreground line-clamp-1">{property.district}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                                                    <span className="text-xs">{property.rating}</span>
                                                                    <Badge variant="secondary" className="text-xs px-1.5 py-0">{property.availableRooms} phòng</Badge>
                                                                </div>
                                                                <p className="text-sm font-bold text-primary mt-1">Từ {formatPrice(minPrice)}đ</p>
                                                                {distance !== null && (
                                                                    <p className="text-xs text-muted-foreground">📍 {distance.toFixed(1)} km</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Selected Property Card */}
            {selectedProperty && (
                <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-96 z-[1000]">
                    <Card className="shadow-xl">
                        <CardContent className="p-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur"
                                onClick={() => setSelectedProperty(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>

                            <div className="flex">
                                <img src={selectedProperty.images[0]} alt={selectedProperty.name} className="w-32 h-32 object-cover rounded-l-lg" />
                                <div className="flex-1 p-3">
                                    <Badge className="mb-1 bg-green-500 text-xs">{selectedProperty.availableRooms} phòng trống</Badge>
                                    <h3 className="font-semibold text-sm line-clamp-1">{selectedProperty.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <MapPin className="h-3 w-3" />
                                        <span className="line-clamp-1">{selectedProperty.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                        <span className="text-xs">{selectedProperty.rating}</span>
                                        <span className="text-xs font-semibold text-primary">Từ {formatPrice(getPropertyMinPrice(selectedProperty.id))}đ</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs"
                                            onClick={() => {
                                                const destination = `${selectedProperty.latitude},${selectedProperty.longitude}`;
                                                const origin = userLocation ? `${userLocation[0]},${userLocation[1]}` : '';
                                                const url = origin
                                                    ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`
                                                    : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
                                                window.open(url, '_blank');
                                            }}
                                        >
                                            <Route className="h-3 w-3 mr-1" />Chỉ đường
                                        </Button>
                                        <Button size="sm" asChild className="h-7 text-xs">
                                            <Link href={`/rooms?propertyId=${selectedProperty.id}`}>Xem phòng</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default function MapPage() {
    return <MapPageContent />;
}
