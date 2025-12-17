import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function loadFileAsHtml(url) {
  if (!url) return "";

  const ext = url.split('.').pop().toLowerCase().split('?')[0]; 

  if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) {
    const videoType = ext === 'mov' ? 'mp4' : ext;
    return `
      <div style="text-align: center; padding: 20px; border-radius: 8px;">
        <video 
          controls 
          controlsList="nodownload"
          style="max-width: 100%; max-height: 500px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
        >
          <source src="${url}" type="video/${videoType}">
          Your browser does not support video playback.
        </video>
   
      </div>
    `;
  }

  if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext)) {
    const audioType = ext === 'm4a' ? 'mp4' : ext;
    return `
      <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
        <h3 style="margin-bottom: 20px; color: white; font-size: 24px;">Audio Listening</h3>
        <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; width: 90%; max-width: 600px;">
          <audio 
            controls 
            controlsList="nodownload"
            style="width: 100%;"
          >
            <source src="${url}" type="audio/${audioType}">
            Your browser does not support audio playback.
          </audio>
        </div>
      </div>
    `;
  }

  if (ext === 'pdf') {
    return await pdfToHtml(url);
  }

  return await docxToHtml(url);
}

async function docxToHtml(url) {
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
  html = html.replace(
    /<p>(<strong>)?([A-Z0-9\s''',.-]+)(<\/strong>)?<\/p>/g,
    (match, text,) => {
      if (text.trim().length < 5) return match; 
      return `<p style="text-align:center;font-weight:bold;">${text}</p>`;
    }
  );

  html = html.replace(
    /<p centered>/g,
    "<p style='text-align:center;'>"
  );

  return html;
}

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