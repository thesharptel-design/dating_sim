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
    // Remove the code block from the narrative display
    narrative = rawText.replace(match[0], '').trim();
  }

  // 2. Extract Options strictly from "Step 3" section
  // Find the "Step 3" header to identify the options section.
  const step3Regex = /Step\s*3/i;
  const step3Match = rawText.match(step3Regex);

  let textToScan = "";

  if (step3Match && step3Match.index !== undefined) {
    // Only scan text AFTER the "Step 3" header
    textToScan = rawText.substring(step3Match.index);
  } else {
    // If "Step 3" is missing, we assume there are no structured options provided by the GM.
    // This prevents numbers in the narrative (Step 1) from being parsed as buttons.
    textToScan = ""; 
  }

  if (textToScan) {
    const optionRegex = /(\d+)\.\s*(?:\[(.*?)\])?\s*(.*)/g;
    let matchOption;
    
    while ((matchOption = optionRegex.exec(textToScan)) !== null) {
      // Avoid matching the "Step 3" line itself if it happens to look like a list item (unlikely but safe)
      if (matchOption[0].toLowerCase().includes("step")) continue;

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