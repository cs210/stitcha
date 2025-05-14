import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Product } from "@/lib/schemas/global.types";
import { P } from "../text/text";

export function ProductsDetails({ product }: { product: Product }) {
	return (
		<Accordion type='single' collapsible>
			<AccordionItem value='item-1'>
				<AccordionTrigger>Description</AccordionTrigger>
				<AccordionContent>
					<P text={`${product.description}`} />
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value='item-2'>
				<AccordionTrigger>Important Information</AccordionTrigger>
				<AccordionContent>
					<P text={`System Code: ${product.system_code}`} />
					<P text={`Inmetro Cert Number: ${product.inmetro_cert_number}`} />
					<P text={`Barcode: ${product.barcode}`} />
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value='item-3'>
				<AccordionTrigger>Dimensions</AccordionTrigger>
				<AccordionContent>
					<div className='flex flex-col'>
						<P text={`Width: ${product.width}cm`} />
						<P text={`Height: ${product.height}cm`} />
						<P text={`Weight: ${product.weight}g`} />
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
