'use client';

import { Thread } from '@/components/assistant-ui/thread';
import { ThreadList } from '@/components/assistant-ui/thread-list';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEffect } from 'react';

export default function Page() {
	useEffect(() => {
		fetch('/api/openai', {
			method: 'POST'
		})
			.then(res => res.json())
			.then(data => console.log(data));
	}, []);

	return (
		<div className='h-full'>
			<div className='grid h-full grid-cols-[200px_1fr] gap-x-2'>
				<TooltipProvider>
					<ThreadList />
					<Thread />
				</TooltipProvider>
			</div>
		</div>
	);
}