'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@clerk/nextjs';

export default function Page() {
	const { user } = useUser();

	return (
		<div className='p-6 space-y-8'>
			<div>
				<h1 className='text-2xl font-bold mb-2'>Welcome, {user?.fullName}</h1>
				<p className='text-gray-500'>Manage your account settings and preferences</p>
			</div>

			<div className='space-y-6'>
				{/* User Info Section */}
				<div className='space-y-4'>
					<h2 className='text-lg font-semibold'>User Information</h2>
					<div className='grid gap-4'>
						<div>
							<Label>Full Name</Label>
							<Input value={user?.fullName || ''} disabled />
						</div>
						<div>
							<Label>Email</Label>
							<Input value={user?.primaryEmailAddress?.emailAddress || ''} disabled />
						</div>
					</div>
				</div>

				{/* Language Section */}
				<div className='space-y-4'>
					<h2 className='text-lg font-semibold'>Language</h2>
					<Select defaultValue='pt'>
						<SelectTrigger>
							<SelectValue placeholder='Select language' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='pt'>Português</SelectItem>
							<SelectItem value='en'>English</SelectItem>
							<SelectItem value='es'>Español</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='pt-4'>
					<Button>Save Changes</Button>
				</div>
			</div>
		</div>
	);
}
