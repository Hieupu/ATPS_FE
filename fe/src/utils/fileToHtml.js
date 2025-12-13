import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;


// === Convert DOCX → HTML (fix heading + center alignment) ===
export async function loadFileAsHtml(url) {
  if (!url) return "";

  if (url.endsWith(".pdf")) {
    return await pdfToHtml(url);
  }

  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();

  const result = await mammoth.convertToHtml({
    arrayBuffer: arrayBuffer,
    styleMap: [
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",

      "p[align='center'] => p:fresh(centered)",
    ],
  });

  let html = result.value;

  // Fix paragraphs that SHOULD be centered but Mammoth missed
  html = html.replace(
    /<p>(<strong>)?([A-Z0-9\s’',.-]+)(<\/strong>)?<\/p>/g,
    (match, openBold, text, closeBold) => {
      if (text.trim().length < 5) return match; // Skip short text
      return `<p style="text-align:center;font-weight:bold;">${text}</p>`;
    }
  );

  // Convert Mammoth centered type
  html = html.replace(
    /<p centered>/g,
    "<p style='text-align:center;'>"
  );

  return html;
}


// === Convert PDF → HTML (simple) ===
async function pdfToHtml(url) {
  const pdf = await pdfjsLib.getDocument(url).promise;

  let finalHtml = "<div>";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(it => it.str);
    finalHtml += `<p>${strings.join(" ")}</p>`;
  }
  finalHtml += "</div>";

  return finalHtml;
}
