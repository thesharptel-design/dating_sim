import { GameOption, ParsedResponse } from "../types";

export const parseResponse = (rawText: string): ParsedResponse => {
  let narrative = rawText;
  let statusBlock: string | null = null;
  const options: GameOption[] = [];

  // 1. Extract Code Block for Status
  // Looks for ``` code block or just the content if no ticks provided but follows format
  const codeBlockRegex = /```(?:json|text)?\n([\s\S]*?)\n```/;
  const match = rawText.match(codeBlockRegex);

  if (match) {
    statusBlock = match[1];
    // Remove the code block from the narrative display to avoid duplication
    narrative = rawText.replace(match[0], '').trim();
  }

  // 2. Extract Options STRICTLY from "Step 3" section
  // Find the header for Step 3
  const step3HeaderRegex = /Step\s*3.*?(?:\n|$)/i;
  const step3Match = rawText.match(step3HeaderRegex);

  if (step3Match && step3Match.index !== undefined) {
    // Isolate the content strictly AFTER the Step 3 header
    const step3Content = rawText.substring(step3Match.index + step3Match[0].length);

    // Regex to match options: "1. [Label] Text" or "1. Text"
    // We use the 'm' flag to ensure we match start of lines, preventing inline numbering matches
    const optionRegex = /^(\d+)\.\s*(?:\[(.*?)\])?\s*(.*)$/gm;

    let matchOption;
    while ((matchOption = optionRegex.exec(step3Content)) !== null) {
      // matchOption[1] = id (e.g. "1")
      // matchOption[2] = label inside brackets (e.g. "대화") or undefined
      // matchOption[3] = remaining text (e.g. "그녀에게 말을 건다")
      
      options.push({
        id: matchOption[1],
        label: matchOption[2] || `선택 ${matchOption[1]}`,
        text: matchOption[3].trim()
      });
    }
  }

  return {
    narrative,
    statusBlock,
    options
  };
};