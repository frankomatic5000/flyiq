export type PriceAlert = {
  route: string;
  targetPrice: number;
  status: "stubbed" | "created";
};

export async function setPriceAlert(route?: string, targetPrice = 350): Promise<PriceAlert> {
  return {
    route: route || "NYC-PAR",
    targetPrice,
    status: "stubbed"
  };
}
