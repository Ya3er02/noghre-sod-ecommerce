export type InstanceStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "BOUGHT_BACK";

export interface ProductInstance {
  id: string;
  productId: string;
  serial: string;
  status: InstanceStatus;
  soldAt?: Date;
  orderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInstanceRequest {
  productId: string;
  serial: string;
}

export interface BulkCreateInstancesRequest {
  productId: string;
  serials: string[];
}
