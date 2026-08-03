import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker dynamically from cdn
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractTextFromFile(file: File): Promise<{ text: string; name: string }> {
  const fileName = file.name;
  const fileType = file.type;

  // Plain text, Markdown, Code, CSV, JSON
  if (
    fileType.includes('text') ||
    fileType.includes('json') ||
    fileType.includes('javascript') ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.md') ||
    fileName.endsWith('.csv') ||
    fileName.endsWith('.json') ||
    fileName.endsWith('.js') ||
    fileName.endsWith('.ts') ||
    fileName.endsWith('.py') ||
    fileName.endsWith('.html') ||
    fileName.endsWith('.css')
  ) {
    const text = await file.text();
    return { text: text.trim(), name: fileName };
  }

  // PDF processing
  if (fileType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let extractedText = '';
      const totalPages = Math.min(pdf.numPages, 30); // Max 30 pages for performance

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        extractedText += `--- Page ${i} ---\n${pageText}\n\n`;
      }

      if (!extractedText.trim()) {
        extractedText = `[PDF Document: ${fileName} - No selectable text found or scanned image PDF. Please attach page screenshot for OCR image analysis.]`;
      }

      return { text: extractedText.trim(), name: fileName };
    } catch (err) {
      console.error('PDF extraction failed:', err);
      // Fallback
      return {
        text: `[PDF File: ${fileName} attached. Processing error occurred during browser PDF parsing.]`,
        name: fileName,
      };
    }
  }

  // Generic fallback using text reader
  try {
    const rawText = await file.text();
    return { text: rawText, name: fileName };
  } catch (e) {
    return { text: `[File attached: ${fileName}]`, name: fileName };
  }
}
