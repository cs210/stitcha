import { Order } from '@/lib/schemas/global.types';

export function OrdersDetails({ order }: { order: Order }) {
	return (
		<div className='grid gap-2'>
			<div>
				<p className='text-gray-600'>Client:</p>
				<p>{order.client}</p>
			</div>
			<div>
				<p className='text-gray-600'>Contact:</p>
				<p>{order.contact}</p>
			</div>
			<div>
				<p className='text-gray-600'>Due Date:</p>
				<p>{order.due_date ? new Date(order.due_date).toLocaleDateString() : ''}</p>
			</div>
			<div>
				<p className='text-gray-600'>Order Quantity:</p>
				<p>{order.order_quantity}</p>
			</div>
		</div>
	);
}
