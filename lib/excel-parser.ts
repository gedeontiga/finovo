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

interface ParsedCell {
  value: string;
  row: number;
  col: number;
}

/**
 * Enhanced Excel parser with intelligent pattern detection
 * Handles various file structures, merged cells, and inconsistent formatting
 */
export async function parseBudgetExcel(
  fileBuffer: ArrayBuffer,
): Promise<ExtractedBudgetLine[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const results: ExtractedBudgetLine[] = [];
  const patternCache = new Map<string, RegExp>();

  workbook.eachSheet((worksheet) => {
    const sheetName = worksheet.name.toUpperCase();

    // Enhanced program detection: P116, PROG116, PROGRAMME 116, etc.
    const programMatch = sheetName.match(/(?:P|PROG(?:RAMME)?)\s*(\d{3})/i);
    if (!programMatch) {
      return;
    }

    const currentProgramCode = programMatch[1];
    const currentProgramName = `Programme ${currentProgramCode}`;

    // State tracking with defaults
    let currentActionCode = "01";
    let currentActionName = "Action 01";
    let currentActivityCode = "01";
    let currentActivityName = "Activité 01";
    let currentAdminCode = "";
    let currentAdminName = "";

    // Dynamic column detection
    const columnMap = detectColumnStructure(worksheet);

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const getCellValue = (colIndex: number): string => {
        const cell = row.getCell(colIndex);
        const val =
          cell.isMerged && cell.master ? cell.master.value : cell.value;
        if (val === null || val === undefined) return "";
        if (typeof val === "object" && "richText" in val) {
          return val.richText.map((rt: any) => rt.text).join("");
        }
        return val.toString().trim();
      };

      const getNumericValue = (colIndex: number): number => {
        const val = getCellValue(colIndex);
        const clean = val.replace(/[\s,]/g, "");
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
      };

      // Collect all cell values for pattern matching
      const rowData = Array.from({ length: 20 }, (_, i) => getCellValue(i + 1));
      const fullRowText = rowData.join(" ").toLowerCase();

      // Skip header and total rows
      if (isHeaderOrTotalRow(fullRowText)) {
        return;
      }

      // Pattern 1: Action detection
      const actionPattern = getOrCreatePattern(
        patternCache,
        "action",
        /^action\s+(\d+)\s*:(.+)/i,
      );

      for (let i = 0; i < rowData.length; i++) {
        const actionMatch = rowData[i].match(actionPattern);
        if (actionMatch) {
          currentActionCode = actionMatch[1].padStart(2, "0");
          currentActionName = rowData[i].trim();
          currentActivityCode = "01";
          currentActivityName = "Activité 01";

          return;
        }
      }

      // Pattern 2: Activity detection (multiple formats)
      const activityPatterns = [
        /\[(\d{2})\]\s*(.+?)(?:\s+département|$)/i,
        /activit[éeè]\s*(\d{2})\s*:?\s*(.+)/i,
        /^(\d{2})\s*[-–]\s*(.+)/,
      ];

      for (const pattern of activityPatterns) {
        for (let i = 0; i < rowData.length; i++) {
          const activityMatch = rowData[i].match(pattern);
          if (activityMatch && !rowData[columnMap.paragraph]) {
            currentActivityCode = activityMatch[1].padStart(2, "0");
            currentActivityName = activityMatch[2]
              .replace(/^total\s+activit[éeè]\s+/i, "")
              .trim();

            return;
          }
        }
      }

      // Pattern 3: Administrative Unit detection
      const adminCode = rowData[columnMap.adminCode];
      const adminName = rowData[columnMap.adminName];

      if (
        adminCode &&
        adminCode.length > 0 &&
        adminCode.length < 15 &&
        !/^\d{6}$/.test(adminCode) &&
        !fullRowText.includes("total")
      ) {
        currentAdminCode = adminCode;
        currentAdminName = adminName || adminCode;

        return;
      }

      // Pattern 4: Budget line extraction
      const paragraphCode = rowData[columnMap.paragraph];

      if (paragraphCode && /^\d{6}$/.test(paragraphCode)) {
        // Validate it's a real budget line
        if (
          fullRowText.includes("total") ||
          fullRowText.includes("montant total")
        ) {
          return;
        }

        const ae = getNumericValue(columnMap.ae + 1);
        const cp = getNumericValue(columnMap.cp + 1);
        const engaged = getNumericValue(columnMap.engaged + 1);

        // Skip empty lines
        if (ae === 0 && cp === 0 && engaged === 0) {
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
          paragraphCode: paragraphCode,
          paragraphName: rowData[columnMap.paragraphName] || "Sans nom",
          ae,
          cp,
          engaged,
        };

        results.push(budgetLine);

        if (rowNumber % 50 === 0) {
        }
      }
    });
  });

  // Post-processing validation
  const validated = validateAndCleanData(results);

  // Show distribution
  showExtractionSummary(validated);

  return validated;
}

/**
 * Detect column structure dynamically
 */
function detectColumnStructure(
  worksheet: ExcelJS.Worksheet,
): Record<string, number> {
  const headerRow = findHeaderRow(worksheet);

  if (!headerRow) {
    // Fallback to default structure
    return {
      paragraph: 5,
      paragraphName: 6,
      ae: 7,
      cp: 8,
      engaged: 9,
      adminCode: 3,
      adminName: 4,
    };
  }

  const columnMap: Record<string, number> = {};

  headerRow.eachCell((cell, colNumber) => {
    const value = cell.value?.toString().toLowerCase() || "";

    if (value.includes("paragraphe") && value.includes("code")) {
      columnMap.paragraph = colNumber - 1;
    } else if (value.includes("paragraphe") || value.includes("libellé")) {
      columnMap.paragraphName = colNumber - 1;
    } else if (value.includes("ae") || value.includes("autoris")) {
      columnMap.ae = colNumber - 1;
    } else if (value.includes("cp") || value.includes("crédit")) {
      columnMap.cp = colNumber - 1;
    } else if (value.includes("engagé") || value.includes("engaged")) {
      columnMap.engaged = colNumber - 1;
    } else if (value.includes("département") || value.includes("admin")) {
      if (!columnMap.adminCode) {
        columnMap.adminCode = colNumber - 1;
        columnMap.adminName = colNumber;
      }
    }
  });

  return columnMap;
}

function findHeaderRow(worksheet: ExcelJS.Worksheet): ExcelJS.Row | null {
  let headerRow: ExcelJS.Row | null = null;

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 50) return false; // Stop after 50 rows

    const rowText = row.values?.toString().toLowerCase() || "";
    if (rowText.includes("paragraphe") && rowText.includes("ae")) {
      headerRow = row;
      return false;
    }
  });

  return headerRow;
}

function isHeaderOrTotalRow(text: string): boolean {
  const skipPatterns = [
    /total\s+programme/i,
    /total\s+action/i,
    /total\s+activit[éeè]/i,
    /montant\s+total/i,
    /^activit[éeè]s$/i,
    /^t[âa]ches$/i,
    /paragraphes/i,
    /libell[ée]/i,
    /r[ée]partition/i,
  ];

  return skipPatterns.some((pattern) => pattern.test(text));
}

function getOrCreatePattern(
  cache: Map<string, RegExp>,
  key: string,
  pattern: RegExp,
): RegExp {
  if (!cache.has(key)) {
    cache.set(key, pattern);
  }
  return cache.get(key)!;
}

function validateAndCleanData(
  lines: ExtractedBudgetLine[],
): ExtractedBudgetLine[] {
  return lines.filter((line) => {
    // Remove invalid entries
    if (!line.paragraphCode || line.paragraphCode.length !== 6) return false;
    if (line.ae < 0 || line.cp < 0 || line.engaged < 0) return false;
    if (line.engaged > line.ae * 1.5) {
    }
    return true;
  });
}

function showExtractionSummary(lines: ExtractedBudgetLine[]): void {
  const byProgram = lines.reduce(
    (acc, line) => {
      acc[line.programCode] = (acc[line.programCode] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const byAction = lines.reduce(
    (acc, line) => {
      const key = `${line.programCode}-${line.actionCode}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

/**
 * Calculate statistics with proper formulas
 */
export function calculateBudgetStatistics(lines: ExtractedBudgetLine[]) {
  const totalAE = lines.reduce((sum, line) => sum + line.ae, 0);
  const totalCP = lines.reduce((sum, line) => sum + line.cp, 0);
  const totalEngaged = lines.reduce((sum, line) => sum + line.engaged, 0);

  // Execution Rate = (Engaged / AE) * 100
  const executionRate = totalAE > 0 ? (totalEngaged / totalAE) * 100 : 0;
  const disponible = totalAE - totalEngaged;

  return {
    ae: totalAE,
    cp: totalCP,
    engaged: totalEngaged,
    executionRate,
    disponible,
    linesCount: lines.length,
  };
}

/**
 * Group by program with aggregations
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
    disponible: prog.ae - prog.engaged,
    linesCount: prog.lines.length,
  }));
}
