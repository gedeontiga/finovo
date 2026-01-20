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

/**
 * Improved Excel parser with better pattern recognition
 * Fixes the issue with "General Activity" and "Action 5 : Renforcement" appearing incorrectly
 */
export async function parseBudgetExcel(
  fileBuffer: ArrayBuffer,
): Promise<ExtractedBudgetLine[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const results: ExtractedBudgetLine[] = [];

  workbook.eachSheet((worksheet) => {
    const sheetName = worksheet.name.toUpperCase();

    // Match program sheets: P116, P117, P118, P119, etc.
    const programMatch = sheetName.match(/P(\d{3})/);
    if (!programMatch) {
      console.log(`Skipping non-program sheet: ${sheetName}`);
      return;
    }

    const currentProgramCode = programMatch[1];
    const currentProgramName = `Programme ${currentProgramCode}`;

    console.log(`\n=== Processing ${sheetName} (P${currentProgramCode}) ===`);

    // State tracking
    let currentActionCode = "01";
    let currentActionName = "Action 01";
    let currentActivityCode = "01";
    let currentActivityName = "Activité 01";
    let currentAdminCode = "";
    let currentAdminName = "";
    let inDataSection = false;

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      // Helper functions
      const getVal = (idx: number): string => {
        const cell = row.getCell(idx);
        const val =
          cell.isMerged && cell.master ? cell.master.value : cell.value;
        return val ? val.toString().trim() : "";
      };

      const getNum = (idx: number): number => {
        const val = getVal(idx);
        const clean = val.replace(/[\s,]/g, "");
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
      };

      // Column mapping (based on your PDF structure)
      const colA = getVal(1);
      const colB = getVal(2);
      const colC = getVal(3);
      const colD = getVal(4);
      const colE = getVal(5);
      const colF = getVal(6); // Paragraph Code
      const colG = getVal(7); // Paragraph Name
      const colH = getNum(8); // AE
      const colI = getNum(9); // CP
      const colJ = getNum(10); // Engaged

      const fullRowText = [colA, colB, colC, colD, colE, colF, colG]
        .join(" ")
        .toLowerCase();

      // Skip header rows and total rows
      if (
        fullRowText.includes("total programme") ||
        fullRowText.includes("total action") ||
        fullRowText.includes("total activité") ||
        fullRowText.includes("activites") ||
        fullRowText.includes("taches") ||
        fullRowText.includes("paragraphes") ||
        fullRowText.includes("libellé")
      ) {
        inDataSection = true;
        return;
      }

      // Detect Action headers: "Action 1 :", "Action 2 :", etc.
      if (colA && colA.match(/^Action\s+\d+\s*:/i)) {
        const actionMatch = colA.match(/Action\s+(\d+)\s*:\s*(.+)/i);
        if (actionMatch) {
          currentActionCode = actionMatch[1].padStart(2, "0");
          currentActionName = colA.trim();
          console.log(
            `Found Action: ${currentActionCode} - ${currentActionName}`,
          );
          // Reset activity when action changes
          currentActivityCode = "01";
          currentActivityName = "Activité 01";
        }
        return;
      }

      // Detect Activity headers: "[01]", "[02]", etc. in column A or B
      const activityMatch = (colA + " " + colB).match(
        /\[(\d{2})\]\s*(.+?)(?:\s+Département|$)/,
      );
      if (activityMatch && !colF) {
        currentActivityCode = activityMatch[1];
        // Extract clean activity name
        const rawName = activityMatch[2].trim();
        // Remove "Total Activité" prefix if present
        currentActivityName = rawName
          .replace(/^Total\s+Activité\s+/i, "")
          .trim();
        console.log(
          `Found Activity: ${currentActivityCode} - ${currentActivityName}`,
        );
        return;
      }

      // Detect Administrative Unit (usually in columns D and E)
      if (
        colD &&
        colD.length > 0 &&
        colD.length < 10 &&
        !colD.match(/^\d{6}$/)
      ) {
        currentAdminCode = colD;
        currentAdminName = colE || colD;
        return;
      }

      // Extract budget line data: Must have valid 6-digit paragraph code
      if (colF && /^\d{6}$/.test(colF)) {
        // Additional validation: skip if this looks like a header or total
        if (
          fullRowText.includes("total") ||
          fullRowText.includes("montant total")
        ) {
          return;
        }

        // Skip rows with no financial values
        if (colH === 0 && colI === 0 && colJ === 0) {
          return;
        }

        const budgetLine: ExtractedBudgetLine = {
          programCode: currentProgramCode,
          programName: currentProgramName,
          actionCode: currentActionCode,
          actionName: currentActionName,
          activityCode: currentActivityCode,
          activityName: currentActivityName,
          adminUnitCode: currentAdminCode,
          adminUnitName: currentAdminName,
          paragraphCode: colF,
          paragraphName: colG || "Sans nom",
          ae: colH,
          cp: colI,
          engaged: colJ,
        };

        results.push(budgetLine);

        console.log(
          `Line ${rowNumber}: P${currentProgramCode}.${currentActionCode}.${currentActivityCode} ` +
            `[${colF}] AE:${colH} CP:${colI} Engaged:${colJ}`,
        );
      }
    });
  });

  console.log(`\n=== Extraction Summary ===`);
  console.log(`Total budget lines extracted: ${results.length}`);

  // Show distribution by program
  const byProgram = results.reduce(
    (acc, line) => {
      acc[line.programCode] = (acc[line.programCode] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log("Lines per program:", byProgram);

  return results;
}

/**
 * Calculate accurate statistics from extracted data
 */
export function calculateBudgetStatistics(lines: ExtractedBudgetLine[]) {
  const totalAE = lines.reduce((sum, line) => sum + line.ae, 0);
  const totalCP = lines.reduce((sum, line) => sum + line.cp, 0);
  const totalEngaged = lines.reduce((sum, line) => sum + line.engaged, 0);

  // FIXED: Correct execution rate calculation
  const executionRate = totalAE > 0 ? (totalEngaged / totalAE) * 100 : 0;
  const disponible = totalAE - totalEngaged;

  return {
    ae: totalAE,
    cp: totalCP,
    engaged: totalEngaged,
    executionRate: executionRate,
    disponible: disponible,
    linesCount: lines.length,
  };
}

/**
 * Group budget lines by program for analysis
 */
export function groupByProgram(lines: ExtractedBudgetLine[]) {
  const grouped = lines.reduce(
    (acc, line) => {
      const key = line.programCode;
      if (!acc[key]) {
        acc[key] = {
          code: line.programCode,
          name: line.programName,
          ae: 0,
          cp: 0,
          engaged: 0,
          lines: [],
        };
      }
      acc[key].ae += line.ae;
      acc[key].cp += line.cp;
      acc[key].engaged += line.engaged;
      acc[key].lines.push(line);
      return acc;
    },
    {} as Record<string, any>,
  );

  return Object.values(grouped).map((prog: any) => ({
    ...prog,
    executionRate: prog.ae > 0 ? (prog.engaged / prog.ae) * 100 : 0,
    linesCount: prog.lines.length,
  }));
}
