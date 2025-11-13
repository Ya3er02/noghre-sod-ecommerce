export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  nationalCode?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  title: string;
  province: string;
  city: string;
  postalCode: string;
  fullAddress: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface CreateAddressRequest {
  userId: string;
  title: string;
  province: string;
  city: string;
  postalCode: string;
  fullAddress: string;
  isDefault?: boolean;
}
