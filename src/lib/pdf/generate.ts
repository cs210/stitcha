import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Product } from '../schemas/global.types';

async function captureElement(element: HTMLElement): Promise<{ dataUrl: string; canvas: HTMLCanvasElement }> {
	// Force the element to be fully expanded before measuring
	const originalStyles = {
			height: element.style.height,
			maxHeight: element.style.maxHeight,
			overflow: element.style.overflow,
			display: element.style.display
	};

	// Temporarily modify the element to ensure full content is visible
	element.style.height = 'auto';
	element.style.maxHeight = 'none';
	element.style.overflow = 'visible';
	element.style.display = 'block';

	// Get the full dimensions including any overflow
	const rect = element.getBoundingClientRect();

	// Calculate the maximum dimensions by checking all child elements
	let maxBottom = 0;
	let maxRight = 0;
	const allChildren = element.getElementsByTagName('*');
	for (let i = 0; i < allChildren.length; i++) {
			const child = allChildren[i] as HTMLElement;
			const childRect = child.getBoundingClientRect();
			maxBottom = Math.max(maxBottom, childRect.bottom - rect.top);
			maxRight = Math.max(maxRight, childRect.right - rect.left);
	}

	// Use the maximum of all possible measurements
	const fullHeight = Math.max(
			element.scrollHeight,
			element.offsetHeight,
			element.clientHeight,
			rect.height,
			maxBottom
	);
	const fullWidth = Math.max(
			element.scrollWidth,
			element.offsetWidth,
			element.clientWidth,
			rect.width,
			maxRight
	);

	// Restore original styles
	element.style.height = originalStyles.height;
	element.style.maxHeight = originalStyles.maxHeight;
	element.style.overflow = originalStyles.overflow;
	element.style.display = originalStyles.display;

	const canvas = await html2canvas(element, {
			scale: 2, // Higher resolution
			useCORS: true,
			logging: true, // Enable logging to debug capture issues
			backgroundColor: '#ffffff',
			height: fullHeight,
			windowHeight: fullHeight,
			width: fullWidth,
			windowWidth: fullWidth,
			onclone: (clonedDoc) => {
					const clonedElement = clonedDoc.body.querySelector('[data-html2canvas-clone]') as HTMLElement;
					if (clonedElement) {
							// Force the cloned element to show all content
							clonedElement.style.width = `${fullWidth}px`;
							clonedElement.style.height = `${fullHeight}px`;
							clonedElement.style.maxHeight = 'none';
							clonedElement.style.maxWidth = 'none';
							clonedElement.style.overflow = 'visible';
							clonedElement.style.display = 'block';
							clonedElement.style.position = 'relative';
							clonedElement.style.transform = 'none';

							// Handle all child elements
							const allChildren = clonedElement.getElementsByTagName('*');
							for (let i = 0; i < allChildren.length; i++) {
									const child = allChildren[i] as HTMLElement;
									// Force each child to be fully visible
									child.style.overflow = 'visible';
									child.style.maxHeight = 'none';
									child.style.maxWidth = 'none';
									child.style.height = 'auto';
									child.style.display = child.style.display === 'none' ? 'none' : 'block';
									// Remove any fixed positioning that might affect layout
									if (child.style.position === 'fixed') {
											child.style.position = 'absolute';
									}
									// Remove any transforms that might affect layout
									child.style.transform = 'none';
							}
					}
			}
	});

	return {
			dataUrl: canvas.toDataURL('image/png'),
			canvas: canvas
	};
}

/**
 * Generates a PDF document for a product
 * @param productImageRef - Ref to the main product image container
 * @param productDetailsRef - Ref to the product details grid
 * @param product - The product data
 * @returns Promise<Uint8Array> - The generated PDF as a Uint8Array
 */
export async function generateProductPDF(
    productImageRef: HTMLElement,
    productDetailsRef: HTMLElement,
    product: Product
): Promise<Uint8Array> {
    try {
        // Capture elements once
        const { dataUrl: productImageData, canvas: imageCanvas } = await captureElement(productImageRef);
        const { dataUrl: productDetailsData, canvas: detailsCanvas } = await captureElement(productDetailsRef);

        // Create PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const margin = 20; // margin in mm
        const maxWidth = pageWidth - (2 * margin); // Available width accounting for margins
        let currentY = margin; // Start from top margin

        // Add title with automatic font size adjustment for single line
        let fontSize = 24;
        pdf.setFont('helvetica', 'bold');

        // Reduce font size until the title fits in one line
        do {
            pdf.setFontSize(fontSize);
            const titleWidth = pdf.getTextWidth(product.name);
            if (titleWidth <= maxWidth || fontSize <= 12) {
                pdf.text(product.name, margin, currentY);
                break;
            }
            fontSize -= 1;
        } while (fontSize > 12);

        // Move down after title
        currentY += (fontSize * 0.3528) + 10; // Convert pt to mm and add 10mm padding

        // Add product image - calculate proper dimensions
        const imgWidth = 120; // smaller width
        const imageAspectRatio = imageCanvas.height / imageCanvas.width;
        const imgHeight = imgWidth * imageAspectRatio;

        // Center the image horizontally
        const leftMargin = (pageWidth - imgWidth) / 2;

        // Check if we need a new page for the image
        if (currentY + imgHeight > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
        }

        pdf.addImage(productImageData, 'PNG', leftMargin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10; // 10mm padding after image

        // Add product details - preserve original dimensions
        // Convert canvas dimensions from pixels to mm (assuming 96 DPI)
        const pixelsToMm = 0.264583333; // 1 pixel = 0.264583333 mm
        const detailsWidthMm = detailsCanvas.width * pixelsToMm;
        const detailsHeightMm = detailsCanvas.height * pixelsToMm;

        // Scale down if width exceeds page width
        let finalDetailsWidth = detailsWidthMm;
        let finalDetailsHeight = detailsHeightMm;
        if (detailsWidthMm > maxWidth) {
            const scale = maxWidth / detailsWidthMm;
            finalDetailsWidth = maxWidth;
            finalDetailsHeight = detailsHeightMm * scale;
        }

        // Center the details horizontally if smaller than page width
        const detailsLeftMargin = finalDetailsWidth < maxWidth
            ? margin + ((maxWidth - finalDetailsWidth) / 2)
            : margin;

        // Check if we need a new page for details
        if (currentY + finalDetailsHeight > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
        }

        pdf.addImage(productDetailsData, 'PNG', detailsLeftMargin, currentY, finalDetailsWidth, finalDetailsHeight);
        currentY += finalDetailsHeight + 10;

        // Add description
        if (product.description) {
            // Check if we need a new page for description
            if (currentY + 40 > pageHeight - margin) { // 40mm minimum space for description header
                pdf.addPage();
                currentY = margin;
            }

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Description:', margin, currentY);
            pdf.setFont('helvetica', 'normal');

            const lines = pdf.splitTextToSize(product.description, maxWidth);

            // Check if description needs to span multiple pages
            let currentLine = 0;
            while (currentLine < lines.length) {
                currentY += 10; // Space after "Description:" or continue from previous page

                // Calculate how many lines can fit on current page
                const remainingHeight = pageHeight - margin - currentY;
                const lineHeight = 5; // 5mm per line
                const linesPerPage = Math.floor(remainingHeight / lineHeight);

                // Add lines that fit on current page
                const pageLines = lines.slice(currentLine, currentLine + linesPerPage);
                pdf.text(pageLines, margin, currentY);

                currentLine += linesPerPage;

                // If there are more lines, add a new page
                if (currentLine < lines.length) {
                    pdf.addPage();
                    currentY = margin;
                }
            }
        }

        // Return as Uint8Array
        const arrayBuffer = pdf.output('arraybuffer');
        return new Uint8Array(arrayBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
}

/**
 * Generates a technical sheet PDF for a product
 * @param product - The product data to generate the technical sheet from
 * @returns Promise<Buffer> - The generated PDF as a buffer
 */
export async function generateTechnicalSheetPDF(product: Product): Promise<Buffer> {
    // TODO: Implement technical sheet generation logic
    throw new Error('Not implemented');
}

/**
 * Generates a cost breakdown PDF for a product
 * @param product - The product data to generate the cost breakdown from
 * @returns Promise<Buffer> - The generated PDF as a buffer
 */
export async function generateCostBreakdownPDF(product: Product): Promise<Buffer> {
    // TODO: Implement cost breakdown generation logic
    throw new Error('Not implemented');
} 