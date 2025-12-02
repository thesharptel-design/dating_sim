import { GameOption, ParsedResponse } from "../types";

export const parseResponse = (rawText: string): ParsedResponse => {
  let narrative = rawText;
  let statusBlock: string | null = null;
  const options: GameOption[] = [];

  // 1. Extract Code Block for Status
  // More robust regex: 
  // - Handles optional 'json'/'text' label
  // - Handles loose spacing around the block
  // - Non-greedy capture of content
  const codeBlockRegex = /```(?:[\w]*)\s+([\s\S]*?)```/;
  const match = rawText.match(codeBlockRegex);

  if (match) {
    statusBlock = match[1].trim();
    // Remove the entire code block from the narrative display
    narrative = rawText.replace(match[0], '').trim();
  }

  // 2. Extract Options strictly from "Step 3" section
  const step3Regex = /Step\s*3/i;
  const step3Match = rawText.match(step3Regex);

  let textToScan = "";

  if (step3Match && step3Match.index !== undefined) {
    // Only scan text AFTER the "Step 3" header for options
    textToScan = rawText.substring(step3Match.index);
    
    // CRITICAL: Remove the entire "Step 3" section from the narrative text
    // This ensures the user sees a clean story without the raw option list text
    const cutIndex = narrative.search(step3Regex);
    if (cutIndex !== -1) {
      narrative = narrative.substring(0, cutIndex).trim();
    }
  }

  // 3. Clean up Headers ("Step 1", "Step 2") for clean narrative display
  narrative = narrative.replace(/Step\s*1.*?(?:\n|$)/i, '').trim();
  narrative = narrative.replace(/Step\s*2.*?(?:\n|$)/i, '').trim();

  // 4. Parse Options
  if (textToScan) {
    // Regex matches: "1. [Label] Text" or "1. Text" or "1) Text"
    const optionRegex = /(?:^|\n)\s*(\d+)[\.\)]\s*(?:\[(.*?)\])?\s*(.*)/g;
    let matchOption;
    
    while ((matchOption = optionRegex.exec(textToScan)) !== null) {
      // Ignore if the line is just "Step 3. [Options]" header which might match "3."
      if (matchOption[0].toLowerCase().includes("step")) continue;

      const id = matchOption[1];
      const label = matchOption[2] || `선택 ${id}`;
      const text = matchOption[3].trim();

      // Only add if text is valid
      if (text) {
        options.push({
          id,
          label,
          text: matchOption[2] ? `[${matchOption[2]}] ${text}` : text // Combined for button text
        });
      }
    }
  }

  return {
    narrative,
    statusBlock,
    options
  };
};