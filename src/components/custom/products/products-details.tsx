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
				<AccordionTrigger>Description</AccordionTrigger>
				<AccordionContent>
					<P>{product.description}</P>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value='item-2'>
				<AccordionTrigger>Important Information</AccordionTrigger>
				<AccordionContent>
					<P><strong>System Code:</strong> {product.system_code}</P>
					<P><strong>Inmetro Cert Number:</strong> {product.inmetro_cert_number}</P>
					<P><strong>Barcode:</strong> {product.barcode}</P>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value='item-3'>
				<AccordionTrigger>Dimensions</AccordionTrigger>
				<AccordionContent>
					<div className='flex flex-col'>
						<P><strong>Width:</strong> {product.width}cm</P>
						<P><strong>Height:</strong> {product.height}cm</P>
						<P><strong>Weight:</strong> {product.weight}g</P>
					</div>
				</AccordionContent>
			</AccordionItem>
			{product.technical_sheet && (
				<AccordionItem value='item-4'>
					<AccordionTrigger>Technical Sheet</AccordionTrigger>
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
