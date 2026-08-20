import { NoteExport } from "@/types/note";

export function convertToMarkdown(note: NoteExport): string {
  const { title, content } = note;

  let markdown = `# ${title}\n\n`;

  markdown += `## Introduction\n\n${content.intro}\n\n`;

  markdown += `## Key Concepts\n\n`;
  if (content.keyConcepts.length > 0) {
    content.keyConcepts.forEach((concept) => {
      markdown += `- ${concept}\n`;
    });
    markdown += "\n";
  }

  markdown += `## How It Works\n\n${content.howItWorks}\n\n`;

  markdown += `## Example / Analogy\n\n${content.example}\n\n`;

  markdown += `## Summary\n\n${content.summary}\n`;

  return markdown;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadMarkdown(note: NoteExport): void {
  const markdown = convertToMarkdown(note);
  const filename = `${note.title.toLowerCase().replace(/\s+/g, "-")}.md`;
  downloadFile(markdown, filename, "text/markdown");
}
