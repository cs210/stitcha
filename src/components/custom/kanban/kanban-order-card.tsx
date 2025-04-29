import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Order } from "@/lib/schemas/global.types";
import { Draggable } from "@hello-pangea/dnd";
import { Box, Calendar, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { H4 } from "../text/headings";
import { P } from "../text/text";

export function KanbanOrderCard({
  order,
  index,
  onDelete,
}: {
  order: Order;
  index: number;
  onDelete: (orderId: string) => void;
}) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
		<Draggable draggableId={order.id} index={index}>
			{(provided, snapshot) => (
				<Card
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					className={`bg-white border rounded-none border-black/20 w-full cursor-pointer hover:border-black/40 transition-colors ${
						snapshot.isDragging ? 'ring-2 ring-blue-500 shadow-lg' : ''
					}`}
					onClick={() => router.push(`/dashboard/orders/${order.id}`)}
				>
					<div className='p-4 relative'>
						<H4 text='#ORD-1001' className='mb-3' />

						<div className='space-y-2'>
							<div className='flex items-center gap-2'>
								<User className='h-4 w-4' />
								<div className='flex gap-2'>
									<P text='Client:' />
									<P text={order.client} />
								</div>
							</div>

							<div className='flex items-center gap-2'>
								<Box className='h-4 w-4' />
								<div className='flex gap-2'>
									<P text='Products:' />
									<P text='2' />
								</div>
							</div>

							<div className='flex items-center gap-2'>
								<Calendar className='h-4 w-4' />
								<div className='flex gap-2'>
									<P text='Due:' />
									<P text={formatDate(order.due_date)} />
								</div>
							</div>
						</div>

						<Button
							size='sm'
							variant='ghost'
							className='absolute top-3 right-3 text-gray-400 hover:text-red-600 h-7 w-7 bg-white/80 backdrop-blur-sm'
							onClick={(e) => {
								e.stopPropagation();
								onDelete(order.id);
							}}
						>
							<Trash2 className='h-4 w-4' />
						</Button>
					</div>
				</Card>
			)}
		</Draggable>
	);
}
