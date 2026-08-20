export function parseJsonFromLLMText(text: string): unknown | null {
  if (!text) return null;

  const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // fall through to bare JSON extraction
    }
  }

  return findJsonInText(text);
}

function findJsonInText(text: string): unknown | null {
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{" || text[i] === "[") {
      const open = text[i];
      const close = open === "{" ? "}" : "]";
      let depth = 0;
      let inString = false;
      let escaped = false;

      for (let j = i; j < text.length; j++) {
        const ch = text[j];
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === '"') {
          inString = !inString;
          continue;
        }
        if (inString) continue;

        if (ch === open) depth++;
        else if (ch === close) {
          depth--;
          if (depth === 0) {
            try {
              return JSON.parse(text.slice(i, j + 1));
            } catch {
              break;
            }
          }
        }
      }
    }
  }
  return null;
}
