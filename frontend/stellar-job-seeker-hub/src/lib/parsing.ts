
export const parseEmployeeNames = (info: string): string[] => {
  const lines = info
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const namesSet = new Set<string>();

  // This regex finds the first occurrence of common LinkedIn separators or phrases
  // (like '•', connection degree, 'is open to work') and removes everything 
  // from that point to the end of the line.
  const junkRegex = /\s*([•·|,-]|\d+(?:st|nd|rd|th)|is open to work|follows you).*$/i;

  lines.forEach((line) => {
    const cleanName = line.replace(junkRegex, "").trim();

    // Add to set if the result is not empty, has at least two words (heuristic for a name),
    // and is not all-uppercase (to avoid acronyms).
    if (cleanName && cleanName.split(' ').length >= 2 && cleanName !== cleanName.toUpperCase()) {
      namesSet.add(cleanName);
    }
  });

  return Array.from(namesSet);
};
