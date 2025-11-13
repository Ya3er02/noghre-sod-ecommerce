import { api } from "encore.dev/api";

interface LivePriceResponse {
  pricePerGramIrr: number;
  timestamp: Date;
  source: string;
}

// Retrieves live silver price from TGJU API.
export const getLivePrice = api<void, LivePriceResponse>(
  { expose: true, method: "GET", path: "/price/live" },
  async () => {
    try {
      const response = await fetch("https://api.tgju.org/v1/market/indicator/summary-table-data/silver_gram");
      
      if (!response.ok) {
        throw new Error("failed to fetch price from TGJU");
      }

      const data = await response.json() as any;
      const pricePerGramIrr = parseFloat(data.p || data.price || "0");

      return {
        pricePerGramIrr,
        timestamp: new Date(),
        source: "TGJU",
      };
    } catch (error) {
      return {
        pricePerGramIrr: 0,
        timestamp: new Date(),
        source: "TGJU_ERROR",
      };
    }
  }
);
