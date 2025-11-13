import { api, APIError } from "encore.dev/api";
import db from "../db";
import { price } from "~encore/clients";
import type { Scan2ValueProduct, ValueCalculation } from "./types";

interface LookupSerialRequest {
  serial: string;
}

interface LookupSerialResponse {
  product: Scan2ValueProduct;
  valueCalculation: ValueCalculation;
}

// Looks up a serialized product and calculates its current value.
export const lookupSerial = api<LookupSerialRequest, LookupSerialResponse>(
  { expose: true, method: "GET", path: "/value/lookup/:serial" },
  async ({ serial }) => {
    const row = await db.queryRow<{
      serial: string;
      weight_g: number;
      fineness: number;
      buy_price_per_g_irr: number;
      buy_date: Date;
      branch: string;
      status: string;
      remaining_weight_g: number;
      qr_payload_hash: string;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM scan2value_products WHERE serial = ${serial}
    `;

    if (!row) {
      throw APIError.notFound("serial number not found");
    }

    const product: Scan2ValueProduct = {
      serial: row.serial,
      weightG: row.weight_g,
      fineness: row.fineness,
      buyPricePerGIrr: row.buy_price_per_g_irr,
      buyDate: row.buy_date,
      branch: row.branch,
      status: row.status,
      remainingWeightG: row.remaining_weight_g,
      qrPayloadHash: row.qr_payload_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    const livePrice = await price.getLivePrice();
    const currentPricePerG = livePrice.pricePerGramIrr || row.buy_price_per_g_irr;
    
    const pureWeightG = row.remaining_weight_g * (row.fineness / 1000);
    const originalPureWeightG = row.weight_g * (row.fineness / 1000);
    
    const originalCost = originalPureWeightG * row.buy_price_per_g_irr;
    const currentMarketValue = pureWeightG * currentPricePerG;
    const profitLoss = currentMarketValue - originalCost;
    const profitLossPercent = (profitLoss / originalCost) * 100;
    
    const buybackDiscountPercent = 2;
    const guaranteedBuybackQuote = currentMarketValue * (1 - buybackDiscountPercent / 100);

    const valueCalculation: ValueCalculation = {
      currentMarketValue,
      profitLoss,
      profitLossPercent,
      guaranteedBuybackQuote,
    };

    return { product, valueCalculation };
  }
);
