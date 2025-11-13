import { api } from "encore.dev/api";
import { price } from "~encore/clients";

interface CalculatePriceRequest {
  weightG: number;
  fineness: number;
  premiumPercent: number;
  useLivePrice: boolean;
  basePriceIrr: number;
}

interface CalculatePriceResponse {
  totalPriceIrr: number;
  pricePerGramIrr: number;
  premiumIrr: number;
  pureWeightG: number;
}

// Calculates the total price for a product.
export const calculate = api<CalculatePriceRequest, CalculatePriceResponse>(
  { expose: true, method: "POST", path: "/price/calculate" },
  async (req) => {
    let pricePerGramIrr = req.basePriceIrr;

    if (req.useLivePrice) {
      const livePrice = await price.getLivePrice();
      if (livePrice.pricePerGramIrr > 0) {
        pricePerGramIrr = livePrice.pricePerGramIrr;
      }
    }

    const pureWeightG = req.weightG * (req.fineness / 1000);
    const basePrice = pureWeightG * pricePerGramIrr;
    const premiumIrr = basePrice * (req.premiumPercent / 100);
    const totalPriceIrr = basePrice + premiumIrr;

    return {
      totalPriceIrr,
      pricePerGramIrr,
      premiumIrr,
      pureWeightG,
    };
  }
);
