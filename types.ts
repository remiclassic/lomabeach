
export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  image: string;
  gallery?: string[];
  size: string;
  beds: string;
  amenities: string[];
  view: 'Beach' | 'Pool' | 'Garden';
  availability?: 'available' | 'few-left' | 'sold-out';
}

export interface Booking {
  checkIn: string;
  checkOut: string;
  roomId: string;
  guests: number;
  totalPrice: number;
}
