import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Renders an off-screen DOM root to a downloaded PDF (same pipeline as detail forms).
 */
export async function renderDomToPdfFile(root: HTMLDivElement, saveFileName: string): Promise<void> {
  root.style.position = 'absolute';
  root.style.left = '-9999px';
  root.style.top = '0';
  document.body.appendChild(root);

  await new Promise<void>((resolve) => {
    const img = root.querySelector('img');
    if (!img || img.complete) {
      resolve();
      return;
    }
    img.onload = () => resolve();
    img.onerror = () => resolve();
    setTimeout(resolve, 2500);
  });

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(root, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      removeContainer: false
    });
  } finally {
    if (root.parentNode) {
      document.body.removeChild(root);
    }
  }

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let yPosition = 0;
  while (yPosition < imgHeight) {
    if (yPosition > 0) {
      pdf.addPage();
    }
    pdf.addImage(imgData, 'PNG', 0, -yPosition, imgWidth, imgHeight);
    yPosition += pageHeight;
  }

  pdf.save(saveFileName);
}
