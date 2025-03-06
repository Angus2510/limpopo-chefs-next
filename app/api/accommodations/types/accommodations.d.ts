export interface Accommodation {
  id: string;
  roomNumber: string;
  address: string;
  costPerBed: number;
  numberOfOccupants: number;
  occupantType: string;
  occupants: string[];
  roomType: string;
}

export type AccommodationCreate = Omit<Accommodation, "id">;
export type AccommodationUpdate = Partial<AccommodationCreate>;
