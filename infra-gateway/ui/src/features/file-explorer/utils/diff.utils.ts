export interface DiffLine {
  type: "add" | "delete" | "normal";
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
}

export function computeLineDiff(original: string = "", current: string = ""): DiffLine[] {
  const oldLines = original.split("\n");
  const newLines = current.split("\n");

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      result.push({
        type: "normal",
        oldLineNumber: i + 1,
        newLineNumber: j + 1,
        content: oldLines[i],
      });
      i++;
      j++;
    } else if (j < newLines.length && (i >= oldLines.length || !oldLines.slice(i).includes(newLines[j]))) {
      result.push({
        type: "add",
        newLineNumber: j + 1,
        content: newLines[j],
      });
      j++;
    } else if (i < oldLines.length) {
      result.push({
        type: "delete",
        oldLineNumber: i + 1,
        content: oldLines[i],
      });
      i++;
    }
  }

  return result;
}
