export interface Scan2ValueProduct {
  serial: string;
  weightG: number;
  fineness: number;
  buyPricePerGIrr: number;
  buyDate: Date;
  branch: string;
  status: string;
  remainingWeightG: number;
  qrPayloadHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateScan2ValueProductRequest {
  serial: string;
  weightG: number;
  fineness: number;
  buyPricePerGIrr: number;
  buyDate: Date;
  branch: string;
  status: string;
  remainingWeightG: number;
  qrPayloadHash: string;
}

export interface ValueCalculation {
  currentMarketValue: number;
  profitLoss: number;
  profitLossPercent: number;
  guaranteedBuybackQuote: number;
}
