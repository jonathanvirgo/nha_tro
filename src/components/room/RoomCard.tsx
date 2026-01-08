import Link from 'next/link';
import { Heart, MapPin, Star, Maximize, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Room } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  room: Room;
  index?: number;
  variant?: 'default' | 'horizontal';
}

export function RoomCard({ room, index = 0, variant = 'default' }: RoomCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Handle both API (utilities) and mockData (amenities) formats
  const amenities: string[] = (room as any).utilities || (room as any).amenities || [];
  const images: string[] = room.images || [];
  const isAvailable = room.isAvailable !== false; // Default to true if not specified

  if (variant === 'horizontal') {
    return (
      <Card className="group overflow-hidden hover-lift animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-72 h-48 md:h-auto shrink-0">
            <img
              src={images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'}
              alt={room.name}
              className="w-full h-full object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 backdrop-blur hover:bg-background"
            >
              <Heart className="h-4 w-4" />
            </Button>
            {isAvailable ? (
              <Badge className="absolute top-2 left-2 bg-success text-success-foreground">
                Còn trống
              </Badge>
            ) : (
              <Badge variant="secondary" className="absolute top-2 left-2">
                Đã thuê
              </Badge>
            )}
          </div>

          {/* Content */}
          <CardContent className="flex-1 p-4 md:p-6">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link href={`/rooms/${room.id}`} className="hover:text-primary transition-colors">
                    <h3 className="font-semibold text-lg line-clamp-1">{room.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium text-sm">{room.rating}</span>
                    <span className="text-muted-foreground text-sm">({room.reviewCount})</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="line-clamp-1">{room.address}, {room.district}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Maximize className="h-4 w-4" />
                    <span>{room.area}m²</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Tối đa {room.maxOccupants} người</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {amenities.slice(0, 4).map((amenity, i) => (
                    <Badge key={i} variant="secondary" className="text-xs font-normal">
                      {amenity}
                    </Badge>
                  ))}
                  {amenities.length > 4 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      +{amenities.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <span className="text-2xl font-bold text-primary">{formatPrice(room.price)}</span>
                  <span className="text-muted-foreground text-sm">/tháng</span>
                </div>
                <Button asChild className="gradient-primary">
                  <Link href={`/rooms/${room.id}`}>Xem chi tiết</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group overflow-hidden hover-lift animate-fade-in-up",
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 backdrop-blur hover:bg-background"
        >
          <Heart className="h-4 w-4" />
        </Button>
        {isAvailable ? (
          <Badge className="absolute top-2 left-2 bg-success text-success-foreground">
            Còn trống
          </Badge>
        ) : (
          <Badge variant="secondary" className="absolute top-2 left-2">
            Đã thuê
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Link href={`/rooms/${room.id}`} className="hover:text-primary transition-colors flex-1 min-w-0">
            <h3 className="font-semibold line-clamp-1">{room.name}</h3>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-medium text-sm">{room.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{(room as any).motel?.district || room.district}, {(room as any).motel?.province || room.city}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Maximize className="h-3.5 w-3.5" />
            <span>{room.area}m²</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{room.maxOccupants}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {amenities.slice(0, 3).map((amenity, i) => (
            <Badge key={i} variant="secondary" className="text-xs font-normal">
              {amenity}
            </Badge>
          ))}
          {amenities.length > 3 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{amenities.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <span className="text-xl font-bold text-primary">{formatPrice(room.price)}</span>
            <span className="text-muted-foreground text-xs">/tháng</span>
          </div>
          <Button asChild size="sm" className="gradient-primary">
            <Link href={`/rooms/${room.id}`}>Chi tiết</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
