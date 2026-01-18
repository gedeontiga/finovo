import ExcelJS from "exceljs";

// Helper to safely extract cell values (ExcelJS sometimes returns objects for formulas)
function getCellValue(
  row: ExcelJS.Row,
  cellIndex: number
): string | number | null {
  const cell = row.getCell(cellIndex);
  const val = cell.value;

  if (val === null || val === undefined) return null;
  // If it's a formula result/hyperlink object, extract the result
  if (typeof val === "object" && "result" in val) {
    return val.result as string | number;
  }
  // If it's a rich text object, extract the text
  if (typeof val === "object" && "richText" in val) {
    return (val as any).richText.map((t: any) => t.text).join("");
  }
  return val as string | number;
}

export type BudgetDataPoint = {
  programCode: string;
  actionName: string;
  activityName: string;
  adminUnit: string;
  lineItem: {
    code: string;
    name: string;
    ae: number;
    cp: number;
    engage: number;
  };
};

export async function parseAndTransformBudget(
  fileBuffer: ArrayBuffer,
  year: number
): Promise<BudgetDataPoint[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  // 1. Find the correct worksheet (Look for '118' or use the first one)
  let worksheet = workbook.worksheets.find((ws) => ws.name.includes("118"));
  if (!worksheet) worksheet = workbook.worksheets[0];

  const hierarchicalData: BudgetDataPoint[] = [];

  // STATE TRACKERS (Context)
  let currentProgram = "118";
  let currentAction = "Default Action";
  let currentActivity = "Default Activity";
  let currentAdminUnit = "";

  // Iterate rows (ExcelJS is 1-based index)
  // Assuming data typically starts around row 7 based on your image
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < 6) return; // Skip headers

    // Extract raw values using column indexes (A=1, B=2, C=3...)
    const colActivity = getCellValue(row, 2)?.toString(); // Col B
    const colTask = getCellValue(row, 3)?.toString(); // Col C
    const colAdminLabel = getCellValue(row, 5)?.toString(); // Col E
    const colParaCode = getCellValue(row, 6)?.toString(); // Col F
    const colParaLabel = getCellValue(row, 7)?.toString(); // Col G

    // Financials (Sanitize numbers)
    const rawAE = getCellValue(row, 8);
    const rawCP = getCellValue(row, 9);
    const rawEngage = getCellValue(row, 10);

    // Skip "Total" rows
    if (colParaLabel && colParaLabel.toLowerCase().includes("total")) return;

    // 1. Update Context (Fill-Down Logic)
    // If the cell has text, update our state. If empty, keep previous state.
    if (colActivity && colActivity.trim().length > 1)
      currentActivity = colActivity.trim();
    if (colAdminLabel && colAdminLabel.trim().length > 1)
      currentAdminUnit = colAdminLabel.trim();

    // 2. Identify Action Headers (Optional Heuristic)
    // Sometimes Action names appear in the Task column or merged rows
    if (colTask && colTask.toLowerCase().includes("action")) {
      // logic to extract action name if needed
    }

    // 3. Extract Line Item
    if (colParaCode && colParaLabel) {
      hierarchicalData.push({
        programCode: currentProgram,
        actionName: currentAction,
        activityName: currentActivity,
        adminUnit: currentAdminUnit,
        lineItem: {
          code: String(colParaCode),
          name: colParaLabel,
          ae: Number(rawAE) || 0,
          cp: Number(rawCP) || 0,
          engage: Number(rawEngage) || 0,
        },
      });
    }
  });

  return hierarchicalData;
}
