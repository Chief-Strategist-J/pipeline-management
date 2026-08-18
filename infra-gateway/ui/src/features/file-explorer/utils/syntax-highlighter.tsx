import React from "react";

export interface SyntaxTokenPattern {
  type: "comment" | "string" | "keyword" | "type" | "number" | "function" | "operator";
  regex: RegExp;
  className: string;
}

export const SYNTAX_PATTERNS: SyntaxTokenPattern[] = [
  {
    type: "comment",
    regex: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)/,
    className: "text-[#6a9955] italic font-normal",
  },
  {
    type: "string",
    regex: /("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`)/,
    className: "text-[#ce9178]",
  },
  {
    type: "keyword",
    regex: /\b(import|export|from|const|let|var|function|return|async|await|if|else|switch|case|break|default|for|while|try|catch|finally|class|interface|type|extends|implements|new|this|super|def|elif|in|is|not|and|or|lambda|with|as|yield)\b/,
    className: "text-[#c586c0] font-semibold",
  },
  {
    type: "type",
    regex: /\b(string|number|boolean|any|void|unknown|never|object|React|FC|RootState|PayloadAction|Promise|Record|Array|TreeItem|FolderNode|FileNode|ServiceRunnerMeta|ProjectTemplate)\b/,
    className: "text-[#4ec9b0] font-semibold",
  },
  {
    type: "number",
    regex: /\b(true|false|null|undefined|None|True|False|\d+(\.\d+)?)\b/,
    className: "text-[#b5cea8] font-bold",
  },
  {
    type: "function",
    regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/,
    className: "text-[#dcdcaa] font-medium",
  },
  {
    type: "operator",
    regex: /(=>|===|!==|==|!=|&&|\|\||\+|-|\*|\/|%|=|\?|:)/,
    className: "text-[#d4d4d4]",
  },
];

export function highlightLineToTokens(line: string): React.ReactNode[] {
  if (!line) return ["\n"];

  const elements: React.ReactNode[] = [];
  let remaining = line;
  let keyIndex = 0;

  while (remaining.length > 0) {
    let bestMatch: { index: number; length: number; className: string; text: string } | null = null;

    for (const pattern of SYNTAX_PATTERNS) {
      const match = pattern.regex.exec(remaining);
      if (match) {
        const matchIndex = match.index;
        const matchText = match[0];
        if (!bestMatch || matchIndex < bestMatch.index) {
          bestMatch = {
            index: matchIndex,
            length: matchText.length,
            className: pattern.className,
            text: matchText,
          };
        }
      }
    }

    if (!bestMatch) {
      elements.push(<span key={keyIndex++}>{remaining}</span>);
      break;
    }

    if (bestMatch.index > 0) {
      const plainText = remaining.substring(0, bestMatch.index);
      elements.push(<span key={keyIndex++}>{plainText}</span>);
    }

    elements.push(
      <span key={keyIndex++} className={bestMatch.className}>
        {bestMatch.text}
      </span>
    );

    remaining = remaining.substring(bestMatch.index + bestMatch.length);
  }

  return elements;
}
