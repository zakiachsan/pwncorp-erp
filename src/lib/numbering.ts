import prisma from "@/lib/prisma";

/**
 * Generate document number: {PREFIX}/{STORE_CODE}/{YYMM}{SEQ}
 * Example: SRO/WM/2607001
 */
export async function generateDocNumber(
  prefix: string,
  storeId: string,
  modelName: string,
  fieldName: string
): Promise<string> {
  // Get store code
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  const storeCode = store?.code || "XX";

  // Get current date in YYMM format
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const datePrefix = `${yy}${mm}`;

  // Count existing documents this month to generate sequence
  const prismaModel = (prisma as any)[modelName];
  const count = await prismaModel.count({
    where: {
      storeId,
      [fieldName]: { startsWith: `${prefix}/${storeCode}/${datePrefix}` },
    },
  });

  const seq = String(count + 1).padStart(3, "0");
  return `${prefix}/${storeCode}/${datePrefix}${seq}`;
}

/**
 * SO number: SRO/{STORE_CODE}/{YYMM}{SEQ}
 */
export async function generateSONumber(storeId: string): Promise<string> {
  return generateDocNumber("SRO", storeId, "serviceOrder", "soNo");
}

/**
 * WO number: SWO/{STORE_CODE}/{YYMM}{SEQ}
 */
export async function generateWONumber(storeId: string): Promise<string> {
  return generateDocNumber("SWO", storeId, "workOrder", "woNo");
}

/**
 * Invoice number: SRI/{STORE_CODE}/{YYMM}{SEQ}
 */
export async function generateInvNumber(storeId: string): Promise<string> {
  return generateDocNumber("SRI", storeId, "invoice", "invNo");
}

/**
 * Stock Order number: OPO/{STORE_CODE}/{YYMM}{SEQ}
 */
export async function generateStockOrderNumber(storeId: string): Promise<string> {
  return generateDocNumber("OPO", storeId, "stockOrder", "orderNo");
}

/**
 * PR number: PR/{STORE_CODE}/{YYMM}{SEQ}
 */
export async function generatePRNumber(storeId: string): Promise<string> {
  return generateDocNumber("PR", storeId, "purchaseRequest", "prNo");
}

/**
 * PO number: PO/{STORE_CODE}/{YYMM}{SEQ}
 */
export async function generatePONumber(storeId: string): Promise<string> {
  return generateDocNumber("PO", storeId, "purchaseOrder", "poNo");
}

/**
 * Project number: PRJ/{STORE_CODE}/{YYMM}{SEQ}
 */
export async function generateProjectNumber(storeId: string): Promise<string> {
  return generateDocNumber("PRJ", storeId, "project", "projectNo");
}

/**
 * Delivery number: DO/{STORE_CODE}/{YYMM}{SEQ}
 */
export async function generateDeliveryNumber(storeId: string): Promise<string> {
  return generateDocNumber("DO", storeId, "purchaseDelivery", "deliveryNo");
}
