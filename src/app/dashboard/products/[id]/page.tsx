'use client';
 
 import { Header } from '@/components/custom/header';
 import { HeaderContainer } from '@/components/custom/header-container';
 import { Loader } from '@/components/custom/loader';
 import { LoaderContainer } from '@/components/custom/loader-container';
 import { Button } from '@/components/ui/button';
 import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
 import { Product, Progress, User } from '@/lib/schemas/global.types';
 import { ChevronLeft, ChevronRight, Search, Users, X, ZoomIn } from 'lucide-react';
 import Image from 'next/image';
import Link from 'next/link';
 import { useRouter } from 'next/navigation';
 import { use, useEffect, useState } from 'react';
 import { toast } from 'sonner';
 
 export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
 	const unwrappedParams = use(params);
 	const router = useRouter();
 
 	const [loading, setLoading] = useState(true);
 	const [product, setProduct] = useState<Product | null>(null);
 	const [users, setUsers] = useState<User[]>([]);
 	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
 	const [tempSelectedUsers, setTempSelectedUsers] = useState<User[]>([]);
 	const [progressUpdates, setProgressUpdates] = useState<Progress[]>([]);
 	const [isDialogOpen, setIsDialogOpen] = useState(false);
 	const [searchQuery, setSearchQuery] = useState('');
 	const [isCommandOpen, setIsCommandOpen] = useState(false);
 	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
 	const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
 	const [zoomImageIndex, setZoomImageIndex] = useState(0);
 
 	useEffect(() => {
 		// Reset temporary selection when dialog opens
 		if (isDialogOpen) {
 			setTempSelectedUsers(selectedUsers);
 		}
 	}, [isDialogOpen, selectedUsers]);
 
 	useEffect(() => {
 		async function fetchData() {
 			try {
 				// Fetch product details
 				const productResponse = await fetch(`/api/products/${unwrappedParams.id}`);
 				const productData = await productResponse.json();
 
 				if (!productResponse.ok) {
 					throw new Error(productData.error);
 				}
 
 				setProduct(productData);
 
 				// Fetch all available seamstresses
 				const usersResponse = await fetch('/api/seamstresses');
 				const { data: usersData } = await usersResponse.json();
 
 				if (Array.isArray(usersData)) {
 					setUsers(usersData);
 				}
 
 				// Fetch assigned seamstresses for this product
 				const assignedResponse = await fetch(`/api/products/${unwrappedParams.id}/assigned`);
 				const { data: assignedData } = await assignedResponse.json();
 
 				if (Array.isArray(assignedData)) {
 					// Find the full user objects for assigned seamstresses
 					const assignedUsers = usersData.filter((user) => assignedData.some((assigned) => assigned.user_id === user.id));
 					setSelectedUsers(assignedUsers);
 					setTempSelectedUsers(assignedUsers);
 				}
 			} catch (error) {
 				console.error('Error fetching data:', error);
 			} finally {
 				setLoading(false);
 			}
 		}
 
 		fetchData();
 	}, [unwrappedParams.id]);
 
 	useEffect(() => {
 		async function fetchTimelineUpdates() {
 			if (!product) return;
 
 			try {
 				console.log('Fetching timeline updates for product:', unwrappedParams.id);
 
 				// Fetch both timeline and progress updates
 				const [timelineResponse, progressResponse] = await Promise.all([
 					fetch(`/api/products/${unwrappedParams.id}/timeline`),
 					fetch(`/api/products/${unwrappedParams.id}/progress`),
 				]);
 
 				const [timelineData, progressData] = await Promise.all([timelineResponse.json(), progressResponse.json()]);
 
 				let updates: any[] = [];
 
 				// Add timeline data
 				if (Array.isArray(timelineData.data)) {
 					updates = [...timelineData.data];
 					if (!updates.some((update) => update.status === 'created')) {
 						updates.unshift({
 							id: 'created',
 							created_at: '2025-03-10T13:20:00.000Z',
 							description: `Batch #${product.batch_number || '2024-001'} entered production phase`,
 							status: 'created',
 							user_id: 'system',
 							image_urls: [],
 						});
 					}
 				}
 
				console.log('Updates:', updates);
 
 				// Add progress data
 				if (Array.isArray(progressData.data)) {
 					updates = [
 						...updates,
 						...progressData.data.map((progress) => ({
 							...progress,
 							status: 'progress',							
 							// emotion: progress.emotion,
							user: progress.user,
 							description: `Progress update: ${progress.description || 'No additional notes'}`,
 						})),
 					];
 				}
 
 				// Sort all updates by date
 				updates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
 
				console.log('Updates:', updates);

 				setProgressUpdates(updates);
 			} catch (error) {
 				console.error('Error fetching updates:', error);
 			}
 		}
 
 		fetchTimelineUpdates();
 	}, [unwrappedParams.id, product]);
 
 	// Reset command open state when dialog closes
 	useEffect(() => {
 		if (!isDialogOpen) {
 			setIsCommandOpen(false);
 		}
 	}, [isDialogOpen]);
 
 	const handleUserSelect = (userId: string) => {
 		const user = users.find((u) => u.id === userId);
 		if (user && !tempSelectedUsers.some((u) => u.id === userId)) {
 			setTempSelectedUsers([...tempSelectedUsers, user]);
 		}
 	};
 
 	const handleRemoveUser = (userId: string) => {
 		setTempSelectedUsers(tempSelectedUsers.filter((user) => user.id !== userId));
 	};
 
 	const handleConfirmAssignment = async () => {
 		try {
 			console.log('Attempting to assign seamstresses:', {
 				productId: unwrappedParams.id,
 				seamstressIds: tempSelectedUsers.map((user) => user.id),
 			});
 
 			const response = await fetch(`/api/products/${unwrappedParams.id}/assign`, {
 				method: 'POST',
 				headers: {
 					'Content-Type': 'application/json',
 				},
 				body: JSON.stringify({
 					seamstressIds: tempSelectedUsers.map((user) => user.id),
 				}),
 			});
 
 			const data = await response.json();
 			console.log('API Response:', data);
 
 			if (!response.ok) {
 				throw new Error(data.error || 'Failed to assign seamstresses');
 			}
 
 			// Find newly assigned users (for the progress update)
 			const newlyAssignedUsers = tempSelectedUsers.filter((tempUser) => !selectedUsers.some((selectedUser) => selectedUser.id === tempUser.id));
 
 			// Create progress event if there are new assignments
 			if (newlyAssignedUsers.length > 0) {
 				const newEvent: Progress = {
 					id: `assigned-${Date.now()}`,
 					created_at: new Date().toISOString(),
 					description:
 						newlyAssignedUsers.length === 1
 							? `Product assigned to ${newlyAssignedUsers[0].first_name} ${newlyAssignedUsers[0].last_name}`
 							: `Product assigned to ${newlyAssignedUsers.map((user) => `${user.first_name} ${user.last_name}`).join(', ')}`,
 					status: 'assigned',
 					user_id: newlyAssignedUsers.map((user) => user.id).join(','),
 					image_urls: [],
 				};
 
 				setProgressUpdates((prev) => [...(prev || []), newEvent]);
 			}
 
 			// Update UI state
 			setSelectedUsers(tempSelectedUsers);
 			setIsDialogOpen(false);
 			toast.success('Seamstresses assigned successfully');
 		} catch (error) {
 			console.error('Error in handleConfirmAssignment:', error);
 			toast.error(error instanceof Error ? error.message : 'Failed to assign seamstresses');
 		}
 	};
 
 	const handleDeleteAssignment = async (userId: string) => {
 		try {
 			const response = await fetch(`/api/products/${unwrappedParams.id}/assign`, {
 				method: 'DELETE',
 				headers: {
 					'Content-Type': 'application/json',
 				},
 				body: JSON.stringify({
 					seamstressIds: [userId], // Send as array since the API expects an array
 				}),
 			});
 
 			if (!response.ok) {
 				const data = await response.json();
 				throw new Error(data.error || 'Failed to remove assignment');
 			}
 
 			// Update the UI state
 			setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
 
 			// Add a progress event for the removal
 			const removedUser = selectedUsers.find((user) => user.id === userId);
 			if (removedUser) {
 				const newEvent: Progress = {
 					id: `unassigned-${Date.now()}`,
 					created_at: new Date().toISOString(),
 					description: `Removed assignment from ${removedUser.first_name} ${removedUser.last_name}`,
 					status: 'unassigned',
 					user_id: userId,
 					image_urls: [],
 				};
 
 				setProgressUpdates((prev) => [...(prev || []), newEvent]);
 			}
 
 			toast.success('Assignment removed successfully');
 		} catch (error) {
 			console.error('Error removing assignment:', error);
 			toast.error(error instanceof Error ? error.message : 'Failed to remove assignment');
 		}
 	};
 
 	// Function to open zoom modal
 	const openZoomModal = (index: number) => {
 		setZoomImageIndex(index);
 		setIsZoomModalOpen(true);
 	};
 
 	// Function to navigate to next/previous image in zoom view
 	const navigateZoomImage = (direction: 'next' | 'prev') => {
 		if (!imageUrls.length) return;
 
 		if (direction === 'next') {
 			setZoomImageIndex((prev) => (prev + 1) % imageUrls.length);
 		} else {
 			setZoomImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
 		}
 	};
 
 	// Loading state
 	if (loading) {
 		return (
 			<LoaderContainer>
 				<Loader />
 			</LoaderContainer>
 		);
 	}
 
 	if (!product) {
 		return <div>Product not found</div>;
 	}
 
 	const filteredAvailableUsers = users.filter(
 		(user) =>
 			!tempSelectedUsers.some((selectedUser) => selectedUser.id === user.id) &&
 			(searchQuery === '' ||
 				`${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
 				(user.location?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
 	);
 
 	// Check if image_urls is an array or needs to be converted
 	const imageUrls = Array.isArray(product.image_urls)
 		? product.image_urls
 		: product.image_urls && typeof product.image_urls === 'object'
 		? Object.values(product.image_urls)
 		: [];
 
 	return (
 		<>
 			<HeaderContainer>
 				<Header text={product.name} />
 				<div className='flex items-center gap-4 mt-4'>
 					<div className='flex items-center gap-2'>
 						<span className='text-sm text-gray-500'>Assigned to:</span>
 						{selectedUsers.length > 0 ? (
 							<div className='flex items-center gap-2'>
 								{selectedUsers.map((user) => (
 									<div key={user.id} className='group relative'>
 										<div className='relative w-8 h-8 rounded-full overflow-hidden border-2 border-white'>
 											<Image
 												src={user.image_url || '/placeholder-avatar.jpg'}
 												alt={`${user.first_name} ${user.last_name}`}
 												className='w-full h-full object-cover'
 												width={32}
 												height={32}
 											/>
 										</div>
 										<button
 											onClick={() => handleDeleteAssignment(user.id)}
 											className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
 											title={`Remove ${user.first_name} ${user.last_name}`}
 										>
 											<X className='w-3 h-3' />
 										</button>
 									</div>
 								))}
 							</div>
 						) : (
 							<span className='text-sm text-gray-400'>No seamstresses assigned</span>
 						)}
 					</div>
 					<Dialog
 						open={isDialogOpen}
 						onOpenChange={(open) => {
 							if (!open) {
 								setTempSelectedUsers(selectedUsers);
 								setSearchQuery('');
 							}
 							setIsDialogOpen(open);
 						}}
 					>
 						<DialogTrigger asChild>
 							<Button variant='outline' size='sm'>
 								<Users className='w-4 h-4 mr-2' />
 								Assign Seamstresses
 							</Button>
 						</DialogTrigger>
 						<DialogContent className='sm:max-w-[500px] h-[80vh] flex flex-col'>
 							<DialogHeader>
 								<DialogTitle>Assign Seamstresses</DialogTitle>
 							</DialogHeader>
 							<div className='flex-1 flex flex-col min-h-0'>
 								<div className='space-y-6 flex-1 overflow-y-auto py-4'>
 									<div className='rounded-lg border shadow-md cursor-pointer' onClick={() => setIsCommandOpen(true)}>
 										<div className='flex items-center px-3 py-2 gap-2 text-sm'>
 											<Search className='h-4 w-4 text-gray-500 shrink-0' />
 											<input
 												placeholder='Search seamstresses...'
 												value={searchQuery}
 												onChange={(e) => setSearchQuery(e.target.value)}
 												onClick={(e) => {
 													e.stopPropagation();
 													setIsCommandOpen(true);
 												}}
 												className='flex-1 outline-none bg-transparent placeholder:text-gray-500'
 											/>
 										</div>
 										{isCommandOpen && (
 											<Command>
 												<CommandList>
 													<CommandEmpty>No seamstresses found.</CommandEmpty>
 													<CommandGroup>
 														{filteredAvailableUsers.map((user) => (
 															<CommandItem
 																key={user.id}
 																onSelect={() => {
 																	handleUserSelect(user.id);
 																	setIsCommandOpen(false);
 																}}
 																className='flex items-center gap-2 cursor-pointer'
 															>
 																<div className='w-8 h-8 rounded-full overflow-hidden flex-shrink-0'>
 																	<Image
 																		src={user.image_url || '/placeholder-avatar.jpg'}
 																		alt={`${user.first_name} ${user.last_name}`}
 																		className='w-full h-full object-cover'
 																		width={32}
 																		height={32}
 																	/>
 																</div>
 																<div className='flex-1'>
 																	<p className='font-medium'>
 																		{user.first_name} {user.last_name}
 																	</p>
 																	<p className='text-sm text-gray-500'>{user.location}</p>
 																</div>
 															</CommandItem>
 														))}
 													</CommandGroup>
 												</CommandList>
 											</Command>
 										)}
 									</div>
 
 									{tempSelectedUsers.length > 0 && (
 										<div className='space-y-4 mt-6'>
 											<h3 className='font-medium text-sm text-gray-500'>Selected Seamstresses</h3>
 											{tempSelectedUsers.map((user) => (
 												<div key={user.id} className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg group'>
 													<div className='w-12 h-12 rounded-full overflow-hidden'>
 														<Image
 															src={user.image_url || '/placeholder-avatar.jpg'}
 															alt={`${user.first_name} ${user.last_name}`}
 															className='w-full h-full object-cover'
 															width={48}
 															height={48}
 														/>
 													</div>
 													<div className='flex-1'>
 														<h3 className='font-medium'>
 															{user.first_name} {user.last_name}
 														</h3>
 														<p className='text-sm text-gray-500'>{user.location}</p>
 													</div>
 													<Button
 														variant='ghost'
 														size='icon'
 														className='opacity-0 group-hover:opacity-100 transition-opacity'
 														onClick={() => handleRemoveUser(user.id)}
 													>
 														<X className='h-4 w-4' />
 													</Button>
 												</div>
 											))}
 										</div>
 									)}
 								</div>
 
 								<div className='flex justify-end gap-3 py-4 border-t'>
 									<Button
 										variant='outline'
 										onClick={() => {
 											setTempSelectedUsers(selectedUsers);
 											setSearchQuery('');
 											setIsDialogOpen(false);
 										}}
 									>
 										Cancel
 									</Button>
 									<Button
 										onClick={() => {
 											handleConfirmAssignment();
 											setSearchQuery('');
 										}}
 									>
 										Confirm Assignment
 									</Button>
 								</div>
 							</div>
 						</DialogContent>
 					</Dialog>
 				</div>
 			</HeaderContainer>
 
 			<div className='py-4 space-y-4'>
 				<div className='grid grid-cols-[2fr,1fr] gap-4'>
 					<div className='space-y-4'>
 						<div className='bg-white rounded-2xl p-8 shadow-sm border'>
 							{/* Image Gallery */}
 							<div className='mb-8'>
 								{imageUrls.length > 0 ? (
 									<div className='space-y-4'>
 										{/* Main Image with zoom functionality */}
 										<div
 											className='w-full h-96 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center relative group cursor-zoom-in'
 											onClick={() => openZoomModal(selectedImageIndex)}
 										>
 											<Image
 												src={imageUrls[selectedImageIndex]}
 												alt={product.name}
 												className='w-full h-full object-contain'
 												width={800}
 												height={600}
 												priority
 											/>
 											<div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100'>
 												<ZoomIn className='w-10 h-10 text-white drop-shadow-lg' />
 											</div>
 										</div>
 
 										{/* Thumbnails - only show if there are multiple images */}
 										{imageUrls.length > 1 && (
 											<div className='flex gap-2 overflow-x-auto pb-2'>
 												{imageUrls.map((imageUrl, index) => (
 													<div
 														key={index}
 														className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer transition-all ${
 															selectedImageIndex === index ? 'border-2 border-blue-500 shadow-md' : 'border border-gray-200 hover:border-gray-300'
 														}`}
 														onClick={() => setSelectedImageIndex(index)}
 													>
 														<Image src={imageUrl} alt={`${product.name} - image ${index + 1}`} className='w-full h-full object-cover' width={80} height={80} />
 													</div>
 												))}
 											</div>
 										)}
 									</div>
 								) : (
 									<div className='w-full h-64 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center'>
 										<Image src='/placeholder-image.jpg' alt={product.name} className='w-full h-full object-contain' width={500} height={300} />
 									</div>
 								)}
 							</div>
 
 							{/* Rest of the product information */}
 							<div className='grid grid-cols-2 gap-8'>
 								<div>
 									<h2 className='text-2xl font-semibold mb-4'>Product Information</h2>
 									<div className='space-y-4'>
 										<div className='flex items-baseline'>
 											<span className='text-gray-500 w-32'>System Code</span>
 											<span className='font-medium'>{product.system_code}</span>
 										</div>
 										<div className='flex items-baseline'>
 											<span className='text-gray-500 w-32'>Cert Number</span>
 											<span className='font-medium'>{product.inmetro_cert_number}</span>
 										</div>
 										<div className='flex items-baseline'>
 											<span className='text-gray-500 w-32'>Barcode</span>
 											<span className='font-medium'>{product.barcode}</span>
 										</div>
 										<div className='flex items-baseline'>
 											<span className='text-gray-500 w-32'>Product Type</span>
 											<span className='font-medium'>{product.product_type}</span>
 										</div>
 									</div>
 								</div>
 								<div>
 									<h2 className='text-2xl font-semibold mb-4'>Specifications</h2>
 									<div className='space-y-4'>
 										<div className='flex items-baseline'>
 											<span className='text-gray-500 w-32'>Weight</span>
 											<span className='font-medium'>{product.weight} kg</span>
 										</div>
 										<div className='flex items-baseline'>
 											<span className='text-gray-500 w-32'>Width</span>
 											<span className='font-medium'>{product.width} cm</span>
 										</div>
 										<div className='flex items-baseline'>
 											<span className='text-gray-500 w-32'>Height</span>
 											<span className='font-medium'>{product.height} cm</span>
 										</div>
 										<div className='flex items-baseline'>
 											<span className='text-gray-500 w-32'>Lost %</span>
 											<span className='font-medium'>{product.percent_pieces_lost}%</span>
 										</div>
 									</div>
 								</div>
 							</div>
 							<div className='mt-6'>
 								<h2 className='text-2xl font-semibold mb-4'>Description</h2>
 								<p className='text-gray-500'>{product.description}</p>
 							</div>
 						</div>
 					</div>
 
 					<div className='bg-white rounded-2xl p-8 shadow-sm border'>
 						<h2 className='text-2xl font-semibold mb-8'>Activity Timeline</h2>
 						<div className='relative'>
 							{progressUpdates && progressUpdates.length > 1 && <div className='absolute left-[7px] top-[24px] bottom-[64px] w-[2px] bg-gray-200' />}
 
 							<div className='space-y-12'>
 								{progressUpdates && progressUpdates.length > 0 ? (
 									[...progressUpdates]
 										.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
 										.map((update, index) => (
 											<div key={update.id} className='relative pl-8'>
 												<div className={`absolute left-0 top-[6px] w-4 h-4 rounded-full ${update.status === 'progress' ? 'bg-blue-500' : 'bg-black'}`} />
 												<div>
 													<h3 className='text-lg font-medium'>
 														{update.status === 'created'
 															? 'Product Created'
 															: update.status === 'assigned'
 															? 'Seamstress Assigned'
 															: update.status === 'progress'
 															? `Progress Update`
 															: 'Status Update'}
 													</h3>
 													<p className='text-gray-500 mt-1'>{update.description}</p>
 													{update.user && (
 														<p className='text-gray-500 mt-1'>
 															Seamstress: <Link href={`/dashboard/seamstresses/${update.user_id}`} className="hover:underline">{update.user.first_name} {update.user.last_name}</Link> is feeling {update.emotion}
 														</p>
 													)}
 													<p className='text-gray-500 mt-1'>
 														{new Date(update.created_at)
 															.toLocaleString('en-US', {
 																year: 'numeric',
 																month: '2-digit',
 																day: '2-digit',
 																hour: '2-digit',
 																minute: '2-digit',
 																hour12: false,
 															})
 															.replace(',', '')}
 													</p>
 													{update.image_urls && update.image_urls.length > 0 && (
 														<div className='flex gap-2 mt-2'>
 															{update.image_urls.map((url, idx) => (
 																<div key={idx} className='w-24 h-24 rounded overflow-hidden'>
 																	<Image src={url} alt={`Progress update image ${idx + 1}`} width={96} height={96} className='w-full h-full object-cover' />
 																</div>
 															))}
 														</div>
 													)}
 												</div>
 											</div>
 										))
 								) : (
 									<p className='text-gray-500'>No activity recorded yet.</p>
 								)}
 							</div>
 						</div>
 					</div>
 				</div>
 			</div>
 
 			{/* Image Zoom Modal */}
 			{isZoomModalOpen && (
 				<div className='fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center' onClick={() => setIsZoomModalOpen(false)}>
 					<div className='relative w-full h-full flex items-center justify-center'>
 						{/* Close button */}
 						<button
 							className='absolute top-6 right-6 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2'
 							onClick={() => setIsZoomModalOpen(false)}
 						>
 							<X className='w-8 h-8' />
 						</button>
 
 						{/* Navigation buttons */}
 						{imageUrls.length > 1 && (
 							<>
 								<button
 									className='absolute left-6 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2'
 									onClick={(e) => {
 										e.stopPropagation();
 										navigateZoomImage('prev');
 									}}
 								>
 									<ChevronLeft className='w-10 h-10' />
 								</button>
 								<button
 									className='absolute right-6 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2'
 									onClick={(e) => {
 										e.stopPropagation();
 										navigateZoomImage('next');
 									}}
 								>
 									<ChevronRight className='w-10 h-10' />
 								</button>
 							</>
 						)}
 
 						{/* Zoomed image */}
 						<div className='w-[95%] h-[95%] relative flex items-center justify-center' onClick={(e) => e.stopPropagation()}>
 							<Image
 								src={imageUrls[zoomImageIndex]}
 								alt={`${product.name} - zoomed image`}
 								className='max-w-full max-h-full object-contain'
 								width={2000}
 								height={2000}
 								priority
 								quality={100}
 							/>
 
 							{/* Image counter */}
 							{imageUrls.length > 1 && (
 								<div className='absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium'>
 									{zoomImageIndex + 1} / {imageUrls.length}
 								</div>
 							)}
 						</div>
 					</div>
 				</div>
 			)}
 		</>
 	);