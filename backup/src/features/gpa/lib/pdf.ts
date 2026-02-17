import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&url';

GlobalWorkerOptions.workerSrc = workerSrc;

async function loadDocument(data: ArrayBuffer): Promise<PDFDocumentProxy> {
  const loadingTask = getDocument({ data });
  return loadingTask.promise;
}

interface TextLineItem {
  str: string;
  hasEOL?: boolean;
}

function collapseItemsToLines(items: TextLineItem[]): string {
  const lines: string[] = [];
  let buffer = '';

  items.forEach(({ str, hasEOL }) => {
    const trimmed = str.replace(/\s+/g, ' ').trim();
    if (trimmed.length === 0) {
      if (hasEOL && buffer.length > 0) {
        lines.push(buffer);
        buffer = '';
      }
      return;
    }

    buffer = buffer.length > 0 ? `${buffer} ${trimmed}` : trimmed;

    if (hasEOL) {
      lines.push(buffer);
      buffer = '';
    }
  });

  if (buffer.length > 0) {
    lines.push(buffer);
  }

  return lines.join('\n');
}

export async function extractTextFromPdf(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await loadDocument(buffer);
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const textItems = textContent.items.filter((item): item is TextItem => 'str' in item);
    const lines = textItems.map((item) => ({ str: item.str, hasEOL: Boolean(item.hasEOL) }));
    pages.push(collapseItemsToLines(lines));
  }

  pdf.destroy();
  return pages.join('\n');
}
