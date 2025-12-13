
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

// Helper to capture an element and add to PDF
async function captureAndAddToPDF(pdf: jsPDF, element: HTMLElement, isFirstPage: boolean) {
    if (!element) return;

    try {
        const dataUrl = await toPng(element, {
            backgroundColor: '#09090b',
            quality: 0.95,
            pixelRatio: 2,
            style: {
                height: 'auto',
                overflow: 'visible',
                maxHeight: 'none',
            },
            filter: (node) => !node.classList?.contains('no-export')
        });

        const imgWidth = 210; // A4 width mm
        const pageHeight = 297; // A4 height mm
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        const imgHeight = (img.height * imgWidth) / img.width;

        // If not first page, always add a new page
        if (!isFirstPage) {
            pdf.addPage();
        }

        // Check if image is larger than a single page
        if (imgHeight > pageHeight) {
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
        } else {
            pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
        }

    } catch (err) {
        console.error("Error capturing element:", err);
    }
}

export async function exportPathToPDF(pathTitle: string) {
    const filename = `${pathTitle.toLowerCase().replace(/\s+/g, '-')}-learning-path.pdf`;
    const pdf = new jsPDF('p', 'mm', 'a4');

    // 1. Capture Header/Hero - REMOVED per user request
    // const heroElement = document.getElementById('path-hero');
    // if (heroElement) {
    //     await captureAndAddToPDF(pdf, heroElement, true);
    // }

    // 2. Capture Modules one by one
    const modules = document.querySelectorAll('.printable-module');
    for (let i = 0; i < modules.length; i++) {
        // If i matches 0, it is the first page.
        const isFirst = i === 0;
        await captureAndAddToPDF(pdf, modules[i] as HTMLElement, isFirst);
    }

    pdf.save(filename);
}



