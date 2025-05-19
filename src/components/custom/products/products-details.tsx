import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Product } from "@/lib/schemas/global.types";
import { P } from "../text/text";

export function ProductsDetails({ dict, product }: { dict: any, product: Product }) {
	return (
		<Accordion type='single' collapsible>
			<AccordionItem value='item-1'>
				<AccordionTrigger>{dict.product.details.description}</AccordionTrigger>
				<AccordionContent>
					<P>{product.description}</P>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value='item-2'>
				<AccordionTrigger>{dict.product.details.importantInformation}</AccordionTrigger>
				<AccordionContent>
					<P><strong>{dict.product.details.systemCode}:</strong> {product.system_code}</P>
					<P><strong>{dict.product.details.inmetroCertNumber}:</strong> {product.inmetro_cert_number}</P>
					<P><strong>{dict.product.details.barcode}:</strong> {product.barcode}</P>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value='item-3'>
				<AccordionTrigger>{dict.product.details.dimensions}</AccordionTrigger>
				<AccordionContent>
					<div className='flex flex-col'>
						<P><strong>{dict.product.details.width}:</strong> {product.width}cm</P>
						<P><strong>{dict.product.details.height}:</strong> {product.height}cm</P>
						<P><strong>{dict.product.details.weight}:</strong> {product.weight}g</P>
					</div>
				</AccordionContent>
			</AccordionItem>
			{product.technical_sheet && (
				<AccordionItem value='item-4'>
					<AccordionTrigger>{dict.product.details.technicalSheet}</AccordionTrigger>
					<AccordionContent>
						<div className="flex justify-center">
							<iframe src={product.technical_sheet} width='80%' height='400px' />
						</div>
					</AccordionContent>
				</AccordionItem>
			)}
		</Accordion>
	);
}
