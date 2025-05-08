import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Product } from "@/lib/schemas/global.types";

export default function ProductsDetails({ product }: { product: Product }) {
	return (
		<Accordion type='single' collapsible>
			<AccordionItem value='item-1'>
				<AccordionTrigger>Description</AccordionTrigger>
				<AccordionContent>{product.description}</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
