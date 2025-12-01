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
    // Remove the code block from the narrative display to avoid duplication,
    // or keep it if we want to show it inline.
    // Let's keep it in narrative but also extract it for a special view if needed.
    // For this specific UI, we will strip it from narrative to show it in a dedicated "Terminal" window.
    narrative = rawText.replace(match[0], '').trim();
  }

  // 2. Extract Options
  // Look for patterns like "1. [Option Name] Description" or "1. Option" at the end of text
  const optionRegex = /(\d+)\.\s*(?:\[(.*?)\])?\s*(.*)/g;
  
  // We strictly want options that appear in the "Step 3" section.
  // However, simple regex scanning usually works well enough for RPG bots.
  
  let matchOption;
  while ((matchOption = optionRegex.exec(rawText)) !== null) {
    // Basic filter: Options are usually at the end. 
    // If the index is very early, it might be part of the narrative list.
    // But for now, let's grab all numbered lists that look like choices.
    
    // Check if it's the specific "Step" header
    if(matchOption[0].includes("Step") || matchOption[3].includes("Step")) continue;

    options.push({
      id: matchOption[1],
      label: matchOption[2] || `선택지 ${matchOption[1]}`,
      text: matchOption[3]
    });
  }

  // Fallback: If no options detected via Regex, check if "Step 3" exists and parse lines manually
  if (options.length === 0) {
    const step3Index = rawText.indexOf("Step 3");
    if (step3Index !== -1) {
        const afterStep3 = rawText.substring(step3Index);
        const lines = afterStep3.split('\n');
        lines.forEach(line => {
            const lineMatch = line.match(/^(\d+)\.\s*(.*)/);
            if (lineMatch) {
                 options.push({
                    id: lineMatch[1],
                    label: `선택 ${lineMatch[1]}`,
                    text: lineMatch[2]
                });
            }
        });
    }
  }

  return {
    narrative,
    statusBlock,
    options
  };
};