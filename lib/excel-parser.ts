import ExcelJS from "exceljs";

export interface ExtractedBudgetLine {
  programCode: string;
  actionCode: string;
  activityCode: string;
  activityName: string;
  adminUnitCode: string;
  adminUnitName: string;
  paragraphCode: string;
  paragraphName: string;
  ae: number;
  cp: number;
  engaged: number;
}

export async function parseBudgetExcel(
  fileBuffer: ArrayBuffer,
): Promise<ExtractedBudgetLine[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const results: ExtractedBudgetLine[] = [];

  workbook.eachSheet((worksheet) => {
    const sheetName = worksheet.name.toUpperCase();

    // SKIP non-data sheets
    if (!sheetName.includes("_P") && !sheetName.includes("PROG")) {
      return;
    }

    // Default Program Code from Sheet Name (e.g., FMSB_P119 -> 119)
    let currentProgramCode = "Unknown";
    const progMatch = sheetName.match(/P(\d+)/);
    if (progMatch) currentProgramCode = progMatch[1];

    let currentActivityName = "General Activity";
    let currentActivityCode = "00";
    let currentActionCode = "01"; // Default Action
    let currentAdminCode = "";
    let currentAdminName = "";

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      // Skip headers
      if (rowNumber < 5) return;

      const getVal = (idx: number) => {
        const cell = row.getCell(idx);
        // Handle merged cells
        const val =
          cell.isMerged && cell.master ? cell.master.value : cell.value;
        return val ? val.toString().trim() : "";
      };

      const getNum = (idx: number) => {
        const val = getVal(idx);
        // Remove spaces and commas
        const clean = val.replace(/[\s,]/g, "");
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
      };

      // Columns based on screenshot mapping
      const colA_Activity = getVal(1); // Activity Name
      const colD_AdminCode = getVal(4); // Admin Code
      const colE_AdminName = getVal(5); // Admin Name
      const colF_ParaCode = getVal(6); // Paragraph Code
      const colG_ParaName = getVal(7); // Paragraph Name

      // 1. FILTER OUT TOTAL ROWS (Crucial Fix)
      const lineStr = (colA_Activity + colG_ParaName).toLowerCase();
      if (lineStr.includes("total") || lineStr.includes("montant total")) {
        return; // SKIP THIS ROW
      }

      // 2. STATE UPDATES
      if (colA_Activity && colA_Activity.length > 3) {
        currentActivityName = colA_Activity;
        // Extract code [01]
        const match = colA_Activity.match(/\[(\d+)\]/);
        if (match) currentActivityCode = match[1];
      }

      if (colD_AdminCode) {
        currentAdminCode = colD_AdminCode;
        currentAdminName = colE_AdminName;
      }

      // 3. CAPTURE DATA
      // Must have a 6-digit paragraph code
      if (/^\d{6}$/.test(colF_ParaCode)) {
        results.push({
          programCode: currentProgramCode,
          actionCode: currentActionCode,
          activityCode: currentActivityCode,
          activityName: currentActivityName,
          adminUnitCode: currentAdminCode,
          adminUnitName: currentAdminName,
          paragraphCode: colF_ParaCode,
          paragraphName: colG_ParaName,
          ae: getNum(8),
          cp: getNum(9),
          engaged: getNum(10),
        });
      }
    });
  });

  return results;
}
