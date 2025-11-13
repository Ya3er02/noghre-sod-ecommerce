export type BuybackStatus = 
  | "REQUESTED" 
  | "EVIDENCE_REVIEW" 
  | "APPROVED" 
  | "PRODUCT_RECEIVED" 
  | "VERIFIED" 
  | "PAID" 
  | "REJECTED" 
  | "CANCELLED";

export interface BuybackRequest {
  id: string;
  requestNumber: string;
  userId: string;
  serial: string;
  type: string;
  requestedQtyG?: number;
  quotedPriceIrr: number;
  evidencePhotos: string[];
  status: BuybackStatus;
  returnMethod?: string;
  trackingCode?: string;
  approvedBy?: string;
  approvedAt?: Date;
  finalPriceIrr?: number;
  paidAt?: Date;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBuybackRequest {
  userId: string;
  serial: string;
  type: string;
  requestedQtyG?: number;
  quotedPriceIrr: number;
  evidencePhotos: string[];
  returnMethod?: string;
}

export interface UpdateBuybackStatusRequest {
  id: string;
  status: BuybackStatus;
  approvedBy?: string;
  finalPriceIrr?: number;
  adminNotes?: string;
}
