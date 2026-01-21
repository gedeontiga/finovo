import ExcelJS from "exceljs";

// --- Interfaces ---

export interface BudgetLine {
  programCode: string;
  programName: string;
  actionCode: string;
  actionName: string;
  activityCode: string;
  activityName: string;
  taskName: string; // Added Task (Column 3 in your screenshots)
  adminUnitCode: string;
  adminUnitName: string;
  paragraphCode: string; // The 6-digit code (e.g., 610010)
  paragraphName: string;
  ae: number; // Autorisation d'Engagement
  cp: number; // Crédit de Paiement
  engaged: number; // Engagement
  balance: number; // Solde/Dispo
}

interface ColumnMapping {
  action?: number;
  activity?: number;
  task?: number;
  adminCode?: number;
  adminName?: number;
  paraCode?: number;
  paraName?: number;
  ae?: number;
  cp?: number;
  engaged?: number;
}

interface HierarchyState {
  programCode: string;
  programName: string;
  actionCode: string;
  actionName: string;
  activityCode: string;
  activityName: string;
  taskName: string;
  adminUnitCode: string;
  adminUnitName: string;
}

// --- Helpers ---

/**
 * Cleans numeric strings from Excel which might be formatted as "1 000 000" or "1.000.000"
 */
function parseFrenchNumber(value: any): number {
  if (typeof value === "number") return value;
  if (!value) return 0;

  const stringVal = value.toString().trim();
  // Remove spaces and simple thousands separators
  // Replace comma with dot for decimal
  const clean = stringVal
    .replace(/\s/g, "") // Remove spaces
    .replace(/\./g, "") // Remove dots (often used as thousands separators in FR)
    .replace(/,/g, "."); // Replace comma with dot

  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

/**
 * reliable way to get value from a cell, handling rich text and merges
 */
function getCellValue(row: ExcelJS.Row, colIndex: number): string {
  const cell = row.getCell(colIndex);

  // 1. Handle Merged Cells
  // If this cell is part of a merge but not the master, get value from master
  const targetCell = cell.isMerged && cell.master ? cell.master : cell;

  const val = targetCell.value;

  if (val === null || val === undefined) return "";

  // 2. Handle Rich Text (common in headers or stylized cells)
  if (typeof val === "object" && "richText" in val) {
    return (val as any).richText
      .map((rt: any) => rt.text)
      .join("")
      .trim();
  }

  // 3. Handle Formula results
  if (typeof val === "object" && "result" in val) {
    return (val as any).result?.toString().trim() || "";
  }

  return val.toString().trim();
}

/**
 * Determines which columns correspond to which data points dynamically.
 * Scans the first 20 rows looking for specific headers.
 */
function identifyColumns(
  worksheet: ExcelJS.Worksheet,
): { mapping: ColumnMapping; headerRowIndex: number } | null {
  let mapping: ColumnMapping = {};
  let headerRowIndex = -1;

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 25) return;
    if (headerRowIndex !== -1) return;

    const rowValues = row.values as any[];
    const rowStr = rowValues
      .map((v) => (v ? v.toString().toLowerCase() : ""))
      .join(" ");

    if (
      rowStr.includes("libell") &&
      (rowStr.includes("ae") ||
        rowStr.includes("montant") ||
        rowStr.includes("credit"))
    ) {
      headerRowIndex = rowNumber;

      row.eachCell((cell, colIdx) => {
        const val = getCellValue(row, colIdx).toLowerCase().replace(/\s/g, ""); // strip spaces

        if (val.includes("action")) mapping.action = colIdx;
        else if (val.includes("activit")) mapping.activity = colIdx;
        else if (val.includes("tache") || val.includes("tâche"))
          mapping.task = colIdx;
        else if (val === "code" || val.length === 6) {
          // But standard layout puts Admin around col 3 or 4.
          if (!mapping.adminCode) mapping.adminCode = colIdx;
          else mapping.paraCode = colIdx;
        } else if (val.includes("libell")) {
          if (!mapping.adminName) mapping.adminName = colIdx;
          else mapping.paraName = colIdx;
        } else if (val === "ae" || val.includes("dotation"))
          mapping.ae = colIdx;
        else if (val === "cp") mapping.cp = colIdx;
        else if (val.includes("engage")) mapping.engaged = colIdx;
      });
    }
  });

  if (!mapping.action) mapping.action = 1;
  if (!mapping.activity) mapping.activity = 2;

  // We can assume Admin Code is usually 2 columns before Paragraph Code
  if (mapping.paraCode && !mapping.adminCode && mapping.paraCode > 2) {
    mapping.adminCode = mapping.paraCode - 2;
    mapping.adminName = mapping.paraCode - 1;
  }

  // Final check to ensure we have the essentials
  const isValid = mapping.paraCode && mapping.ae;
  return isValid ? { mapping, headerRowIndex } : null;
}

// --- Main Parser ---

export async function parseBudgetFile(
  fileBuffer: ArrayBuffer,
): Promise<BudgetLine[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const results: BudgetLine[] = [];

  workbook.eachSheet((worksheet) => {
    const sheetName = worksheet.name.toUpperCase();

    // 1. Filter relevant sheets (PROGRAMME sheets or Budget sheets)
    // Based on PDF: "PROGRAMME 116", "117", etc.
    if (
      !sheetName.includes("PROG") &&
      !sheetName.includes("RECETTES") &&
      !sheetName.match(/\d{3}/)
    ) {
      return;
    }

    console.log(`Processing Sheet: ${sheetName}`);

    // 2. Identify Structure
    const structure = identifyColumns(worksheet);
    if (!structure) {
      console.warn(`Could not identify table headers in sheet ${sheetName}`);
      return;
    }
    const { mapping, headerRowIndex } = structure;

    // 3. Initialize State Machine
    // This state persists across rows to handle merged cells/fill-down
    let state: HierarchyState = {
      programCode: sheetName.match(/(\d{3})/)?.[1] || "Unknown",
      programName: sheetName,
      actionCode: "",
      actionName: "",
      activityCode: "",
      activityName: "",
      taskName: "",
      adminUnitCode: "",
      adminUnitName: "",
    };

    // 4. Iterate Rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= headerRowIndex) return; // Skip headers

      // Extract raw values
      const actionRaw = mapping.action ? getCellValue(row, mapping.action) : "";
      const activityRaw = mapping.activity
        ? getCellValue(row, mapping.activity)
        : "";
      const taskRaw = mapping.task ? getCellValue(row, mapping.task) : "";
      const adminCodeRaw = mapping.adminCode
        ? getCellValue(row, mapping.adminCode)
        : "";
      const adminNameRaw = mapping.adminName
        ? getCellValue(row, mapping.adminName)
        : "";

      const paraCodeRaw = mapping.paraCode
        ? getCellValue(row, mapping.paraCode)
        : "";
      const paraNameRaw = mapping.paraName
        ? getCellValue(row, mapping.paraName)
        : "";

      const aeVal = mapping.ae
        ? parseFrenchNumber(getCellValue(row, mapping.ae))
        : 0;
      const cpVal = mapping.cp
        ? parseFrenchNumber(getCellValue(row, mapping.cp))
        : 0;
      const engVal = mapping.engaged
        ? parseFrenchNumber(getCellValue(row, mapping.engaged))
        : 0;

      // --- A. Update Hierarchy State ---

      // Update Action
      if (actionRaw) {
        // Look for pattern "Action 1 :" or just take the text
        const match = actionRaw.match(/Action\s*(\d+)[\s:]+(.*)/i);
        if (match) {
          state.actionCode = match[1];
          state.actionName = match[0]; // Full string
        } else if (actionRaw.toLowerCase().includes("total")) {
          // It's a total row, ignore this update or reset
        } else {
          state.actionName = actionRaw;
        }
      }

      // Update Activity
      // PDF shows "[01] Master..."
      if (activityRaw) {
        const match = activityRaw.match(/^\[(\d+)\]\s*(.*)/);
        if (match) {
          state.activityCode = match[1];
          state.activityName = match[2] || activityRaw;
        } else if (!activityRaw.toLowerCase().includes("total")) {
          state.activityName = activityRaw;
        }
      }

      // Update Task
      if (taskRaw && !taskRaw.toLowerCase().includes("total")) {
        state.taskName = taskRaw;
      }

      // Update Admin Unit
      // Crucial: The Admin Unit usually spans multiple paragraph lines (merged).
      // If `adminCodeRaw` exists, update state. If empty, keep previous state (fill-down).
      if (adminCodeRaw) {
        // Ensure it's not a paragraph code (Admin codes are usually different, or position based)
        // In your PDF, Admin Code is distinct col.
        if (adminCodeRaw.length < 10) {
          // Safety check length
          state.adminUnitCode = adminCodeRaw;
          state.adminUnitName = adminNameRaw;
        }
      }

      // --- B. Identify & Extract Budget Line ---

      // Logic: A valid budget line must have a 6-digit Paragraph Code AND not be a "Total" line
      const isSixDigitPara = /^\d{6}$/.test(paraCodeRaw.replace(/\s/g, ""));
      const isTotalRow =
        paraNameRaw.toLowerCase().includes("total") ||
        actionRaw.toLowerCase().includes("total");

      if (isSixDigitPara && !isTotalRow) {
        results.push({
          programCode: state.programCode,
          programName: state.programName,
          actionCode: state.actionCode,
          actionName: state.actionName,
          activityCode: state.activityCode,
          activityName: state.activityName,
          taskName: state.taskName,
          adminUnitCode: state.adminUnitCode,
          adminUnitName: state.adminUnitName,
          paragraphCode: paraCodeRaw,
          paragraphName: paraNameRaw,
          ae: aeVal,
          cp: cpVal,
          engaged: engVal,
          balance: aeVal - engVal,
        });
      }
    });
  });

  return results;
}
