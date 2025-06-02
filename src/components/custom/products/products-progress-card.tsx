import { Card } from '@/components/ui/card';
import { Progress } from '@/lib/schemas/global.types';
import Image from 'next/image';
import { P } from '../text/text';

// The progress card for each individual progress update
export function ProductsProgressCard({ dict, progress }: { dict: any, progress: Progress }) {
	return (
		<Card className='p-4'>
			<Image src={progress.image_urls[0]} alt={progress.description} width={100} height={100} />
			<P>{new Date(progress.created_at).toLocaleDateString()}</P>
			<P>{progress.description}</P>
			<P>{progress.units_completed} {dict.adminsSection.products.product.progress.unitsCompleted}</P>
			<P>{progress.emotion}</P>
		</Card>
	);
}
