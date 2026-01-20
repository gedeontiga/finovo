import ExcelJS from "exceljs";

export interface ExtractedBudgetLine {
  programCode: string;
  programName: string;
  actionCode: string;
  actionName: string;
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

    // Skip non-program sheets
    if (
      !sheetName.includes("_P") &&
      !sheetName.includes("PROG") &&
      !sheetName.match(/P\d{3}/)
    ) {
      return;
    }

    // Extract Program Code from sheet name (e.g., FMSB_P119 -> 119, P116 -> 116)
    let currentProgramCode = "000";
    let currentProgramName = "Unknown Program";

    const progMatch = sheetName.match(/P(\d{3})/);
    if (progMatch) {
      currentProgramCode = progMatch[1];
      currentProgramName = `Programme ${currentProgramCode}`;
    }

    let currentActivityName = "General Activity";
    let currentActivityCode = "01";
    let currentActionCode = "01";
    let currentActionName = "Action 01";
    let currentAdminCode = "";
    let currentAdminName = "";

    // Track if we're in data rows
    let inDataSection = false;

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      // Helper to get cell value
      const getVal = (idx: number) => {
        const cell = row.getCell(idx);
        const val =
          cell.isMerged && cell.master ? cell.master.value : cell.value;
        return val ? val.toString().trim() : "";
      };

      const getNum = (idx: number) => {
        const val = getVal(idx);
        const clean = val.replace(/[\s,]/g, "");
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
      };

      // Column mapping (adjust based on your Excel structure)
      const colA = getVal(1); // Activity or description
      const colB = getVal(2); // Task or sub-description
      const colC = getVal(3); // Admin or other
      const colD = getVal(4); // Admin Code
      const colE = getVal(5); // Admin Name
      const colF = getVal(6); // Paragraph Code
      const colG = getVal(7); // Paragraph Name
      const colH = getVal(8); // AE column
      const colI = getVal(9); // CP column
      const colJ = getVal(10); // Engaged column

      // Detect header row
      if (
        colG.toLowerCase().includes("libellé") ||
        colG.toLowerCase().includes("paragraphes") ||
        colF.toLowerCase().includes("code")
      ) {
        inDataSection = true;
        return;
      }

      // Skip rows before data section
      if (rowNumber < 4 && !inDataSection) return;

      // Filter out total rows
      const lineStr = (colA + colG).toLowerCase();
      if (
        lineStr.includes("total") ||
        lineStr.includes("montant total") ||
        lineStr.includes("budget")
      ) {
        return;
      }

      // Detect Activity headers (format: "Activity Name [01]" or just in column A)
      if (colA && colA.length > 3 && !colF) {
        const actMatch = colA.match(/\[(\d{2})\]/);
        if (actMatch) {
          currentActivityCode = actMatch[1];
          currentActivityName = colA.replace(/\[\d{2}\]/, "").trim();
        } else {
          // Activity without bracket notation
          currentActivityName = colA;
        }
        return;
      }

      // Detect Action (if present in structure)
      if (colB && colB.match(/Action \d+/i)) {
        const actionMatch = colB.match(/Action (\d+)/i);
        if (actionMatch) {
          currentActionCode = actionMatch[1].padStart(2, "0");
          currentActionName = colB;
        }
        return;
      }

      // Update Admin Unit tracking
      if (colD && colD.length > 0) {
        currentAdminCode = colD;
        currentAdminName = colE || "";
      }

      // Capture budget line data (must have valid 6-digit paragraph code)
      if (/^\d{6}$/.test(colF)) {
        results.push({
          programCode: currentProgramCode,
          programName: currentProgramName,
          actionCode: currentActionCode,
          actionName: currentActionName,
          activityCode: currentActivityCode,
          activityName: currentActivityName,
          adminUnitCode: currentAdminCode,
          adminUnitName: currentAdminName,
          paragraphCode: colF,
          paragraphName: colG,
          ae: getNum(8),
          cp: getNum(9),
          engaged: getNum(10),
        });
      }
    });
  });

  console.log(`Parsed ${results.length} budget lines from Excel`);
  return results;
}
