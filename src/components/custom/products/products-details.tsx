import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Product } from "@/lib/schemas/global.types";
import { P } from "../text/text";

// The details section for each individual product
export function ProductsDetails({ dict, product }: { dict: any, product: Product }) {
	return (
		<Accordion type='single' collapsible>
			<AccordionItem value='item-1'>
				<AccordionTrigger>{dict.adminsSection.product.details.description}</AccordionTrigger>
				<AccordionContent>
					<P>{product.description}</P>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value='item-2'>
				<AccordionTrigger>{dict.adminsSection.product.details.importantInformation}</AccordionTrigger>
				<AccordionContent>
					<P>
						<strong>{dict.adminsSection.product.details.systemCode}:</strong> {product.system_code}
					</P>
					<P>
						<strong>{dict.adminsSection.product.details.inmetroCertNumber}:</strong> {product.inmetro_cert_number}
					</P>
					<P>
						<strong>{dict.adminsSection.product.details.barcode}:</strong> {product.barcode}
					</P>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value='item-3'>
				<AccordionTrigger>{dict.adminsSection.product.details.packagingMaterials}</AccordionTrigger>
				<AccordionContent>
					<div className='flex flex-col'>
						{product.packaging_materials?.map((material, index) => (
							<P key={index}>
								<strong>{material.name}:</strong> {material.quantity}
							</P>
						))}
					</div>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value='item-4'>
				<AccordionTrigger>{dict.adminsSection.product.details.rawMaterials}</AccordionTrigger>
				<AccordionContent>
					<div className='flex flex-col'>
						{product.raw_materials?.map((material, index) => (
							<P key={index}>
								<strong>{material.name}:</strong> {material.quantity}
							</P>
						))}
					</div>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value='item-5'>
				<AccordionTrigger>{dict.adminsSection.product.details.dimensions}</AccordionTrigger>
				<AccordionContent>
					<div className='flex flex-col'>
						<P>
							<strong>{dict.adminsSection.product.details.width}:</strong> {product.width}cm
						</P>
						<P>
							<strong>{dict.adminsSection.product.details.height}:</strong> {product.height}cm
						</P>
						<P>
							<strong>{dict.adminsSection.product.details.weight}:</strong> {product.weight}g
						</P>
					</div>
				</AccordionContent>
			</AccordionItem>
			{product.technical_sheet && (
				<AccordionItem value='item-6'>
					<AccordionTrigger>{dict.adminsSection.product.details.technicalSheet}</AccordionTrigger>
					<AccordionContent>
						<div className='flex justify-center'>
							<iframe src={product.technical_sheet} width='80%' height='400px' />
						</div>
					</AccordionContent>
				</AccordionItem>
			)}
		</Accordion>
	);
}
