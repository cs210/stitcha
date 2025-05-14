'use client';

import { Header } from '@/components/custom/header/header';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { ProductsDetails } from '@/components/custom/products/products-details';
import { ProductsImages } from '@/components/custom/products/products-images';
import { Product } from '@/lib/schemas/global.types';
import { useUser } from '@clerk/nextjs';
import { use, useEffect, useState } from 'react';

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
	const { id: productId } = use(params);
	const { user } = useUser();

	const [loading, setLoading] = useState<boolean>(true);
	const [product, setProduct] = useState<Product | null>(null);

	// const [users, setUsers] = useState<User[]>([]);
	// const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
	// const [tempSelectedUsers, setTempSelectedUsers] = useState<User[]>([]);
	// const [progressUpdates, setProgressUpdates] = useState<TimelineUpdate[]>([]);
	// const [isDialogOpen, setIsDialogOpen] = useState(false);
	// const [searchQuery, setSearchQuery] = useState("");
	// const [isCommandOpen, setIsCommandOpen] = useState(false);
	// const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	// const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
	// const [zoomImageIndex, setZoomImageIndex] = useState(0);
	// const productImageRef = useRef<HTMLDivElement>(null);
	// const productDetailsRef = useRef<HTMLDivElement>(null);
	// const [isPdfGenerating, setIsPdfGenerating] = useState(false);

	// Fetch initial product data
	useEffect(() => {
		if (!user) return;

		(async () => {
			// Get product details
			const productResponse = await fetch(`/api/products/${productId}`);
			const { data, error } = await productResponse.json();

			if (!error) {
				setProduct(data);
			} else {
				console.error('Error fetching product details:', error);
			}

			setLoading(false);
		})();
	}, [user, productId]);

	// Fetch timeline and progress updates separately with a delay
	// useEffect(() => {
	//   let isMounted = true;
	//   const timeoutId = setTimeout(async () => {
	//     if (!product) return;

	//     try {
	//       const [timelineResponse, progressResponse] = await Promise.all([
	//         fetch(`/api/products/${unwrappedParams.id}/timeline`),
	//         fetch(`/api/products/${unwrappedParams.id}/progress`)
	//       ]);

	//       const [timelineData, progressData] = await Promise.all([
	//         timelineResponse.json(),
	//         progressResponse.json()
	//       ]);

	//       if (!isMounted) return;

	//       let updates: TimelineUpdate[] = [];

	//       // Add timeline data
	//       if (Array.isArray(timelineData.data)) {
	//         updates = [...timelineData.data];

	//         if (!updates.some((update) => update.status === "created")) {
	//           updates.unshift({
	//             id: "created",
	//             created_at: new Date().toISOString(),
	//             description: `Batch ${product.system_code} entered production phase`,
	//             emotion: null,
	//             user_id: "system",
	//             image_urls: [],
	//           });
	//         }
	//       }

	//       // Add progress data
	//       if (Array.isArray(progressData.data)) {
	//         updates = [
	//           ...updates,
	//           ...progressData.data
	//         ];
	//       }

	//       // Sort all updates by date
	//       updates.sort(
	//         (a, b) =>
	//           new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	//       );

	//       setProgressUpdates(updates);
	//     } catch (error) {
	//       console.error("Error fetching updates:", error);
	//     }
	//   }, 1000);

	//   return () => {
	//     isMounted = false;
	//     clearTimeout(timeoutId);
	//   };
	// }, [unwrappedParams.id, product]);

	// // Reset temporary selection when dialog opens
	// useEffect(() => {
	//   if (isDialogOpen) {
	//     setTempSelectedUsers(selectedUsers);
	//   } else {
	//     setIsCommandOpen(false);
	//   }
	// }, [isDialogOpen, selectedUsers]);

	// // Handle user selection
	// const handleUserSelect = (userId: string) => {
	//   const user = users.find((u) => u.id === userId);

	//   if (user && !tempSelectedUsers.some((u) => u.id === userId)) {
	//     setTempSelectedUsers([...tempSelectedUsers, user]);
	//   }
	// };

	// // Handle user removal
	// const handleRemoveUser = (userId: string) => {
	//   setTempSelectedUsers(
	//     tempSelectedUsers.filter((user) => user.id !== userId)
	//   );
	// };

	// // Handle assignment confirmation
	// const handleConfirmAssignment = async () => {
	//   try {
	//     const response = await fetch(
	//       `/api/products/${unwrappedParams.id}/assign`,
	//       {
	//         method: "POST",
	//         headers: {
	//           "Content-Type": "application/json",
	//         },
	//         body: JSON.stringify({
	//           seamstressIds: tempSelectedUsers.map((user) => user.id),
	//         }),
	//       }
	//     );

	//     const data = await response.json();

	//     if (!response.ok) {
	//       throw new Error(data.error || "Failed to assign seamstresses");
	//     }

	//     // Find newly assigned users (for the progress update)
	//     const newlyAssignedUsers = tempSelectedUsers.filter(
	//       (tempUser) =>
	//         !selectedUsers.some((selectedUser) => selectedUser.id === tempUser.id)
	//     );

	//     // Create progress event if there are new assignments
	//     if (newlyAssignedUsers.length > 0) {
	//       const newEvent: TimelineUpdate = {
	//         id: `assigned-${Date.now()}`,
	//         created_at: new Date().toISOString(),
	//         description:
	//           newlyAssignedUsers.length === 1
	//             ? `Product assigned to ${newlyAssignedUsers[0].first_name} ${newlyAssignedUsers[0].last_name}`
	//             : `Product assigned to ${newlyAssignedUsers
	//                 .map((user) => `${user.first_name} ${user.last_name}`)
	//                 .join(", ")}`,
	//         emotion: null,
	//         user_id: newlyAssignedUsers.map((user) => user.id).join(","),
	//         image_urls: [],
	//       };

	//       setProgressUpdates((prev) => [...(prev || []), newEvent]);
	//     }

	//     setSelectedUsers(tempSelectedUsers);
	//     setIsDialogOpen(false);

	//     toast.success("Seamstresses assigned successfully");
	//   } catch (error) {
	//     console.error("Error in handleConfirmAssignment:", error);

	//     toast.error(
	//       error instanceof Error ? error.message : "Failed to assign seamstresses"
	//     );
	//   }
	// };

	// // Handle assignment removal
	// const handleDeleteAssignment = async (userId: string) => {
	//   try {
	//     const response = await fetch(
	//       `/api/products/${unwrappedParams.id}/assign`,
	//       {
	//         method: "DELETE",
	//         headers: {
	//           "Content-Type": "application/json",
	//         },
	//         body: JSON.stringify({
	//           seamstressIds: [userId],
	//         }),
	//       }
	//     );

	//     if (!response.ok) {
	//       const data = await response.json();

	//       throw new Error(data.error || "Failed to remove assignment");
	//     }

	//     setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));

	//     const removedUser = selectedUsers.find((user) => user.id === userId);

	//     if (removedUser) {
	//       const newEvent: TimelineUpdate = {
	//         id: `unassigned-${Date.now()}`,
	//         created_at: new Date().toISOString(),
	//         description: `Removed assignment from ${removedUser.first_name} ${removedUser.last_name}`,
	//         emotion: null,
	//         user_id: userId,
	//         image_urls: [],
	//       };

	//       setProgressUpdates((prev) => [...(prev || []), newEvent]);
	//     }

	//     toast.success("Assignment removed successfully");
	//   } catch (error) {
	//     console.error("Error removing assignment:", error);

	//     toast.error(
	//       error instanceof Error ? error.message : "Failed to remove assignment"
	//     );
	//   }
	// };

	// // Function to open zoom modal
	// const openZoomModal = (index: number) => {
	//   setZoomImageIndex(index);
	//   setIsZoomModalOpen(true);
	// };

	// // Function to navigate to next/previous image in zoom view
	// const navigateZoomImage = (direction: "next" | "prev") => {
	//   if (!safeImageUrls.length) return;

	//   if (direction === "next") {
	//     setZoomImageIndex((prev) => (prev + 1) % safeImageUrls.length);
	//   } else {
	//     setZoomImageIndex(
	//       (prev) => (prev - 1 + safeImageUrls.length) % safeImageUrls.length
	//     );
	//   }
	// };

	// const handleGeneratePDF = async () => {
	//   if (!productImageRef.current || !productDetailsRef.current || !product)
	//     return;

	//   setIsPdfGenerating(true);
	//   try {
	//     const pdfData = await generateProductPDF(
	//       productImageRef.current,
	//       productDetailsRef.current,
	//       product
	//     );

	//     // Create a blob from the Uint8Array
	//     const blob = new Blob([pdfData], { type: "application/pdf" });
	//     const url = URL.createObjectURL(blob);

	//     // Create a download link
	//     const link = document.createElement("a");
	//     link.href = url;
	//     link.download = `${product.name}-details.pdf`;
	//     document.body.appendChild(link);
	//     link.click();
	//     document.body.removeChild(link);
	//     URL.revokeObjectURL(url);

	//     toast.success("PDF generated successfully");
	//   } catch (error) {
	//     console.error("Error generating PDF:", error);
	//     toast.error("Failed to generate PDF");
	//   } finally {
	//     setIsPdfGenerating(false);
	//   }
	// };

	// // Filter available users
	// const filteredAvailableUsers = users.filter(
	//   (user) =>
	//     !tempSelectedUsers.some((selectedUser) => selectedUser.id === user.id) &&
	//     (searchQuery === "" ||
	//       `${user.first_name} ${user.last_name}`
	//         .toLowerCase()
	//         .includes(searchQuery.toLowerCase()) ||
	//       (user.location?.toLowerCase() || "").includes(
	//         searchQuery.toLowerCase()
	//       ))
	// );

	// // Type guard for image URLs
	// const safeImageUrls: string[] = useMemo(() => {
	//   if (!product?.image_urls) return [];

	//   if (Array.isArray(product.image_urls)) {
	//     return product.image_urls.filter((url): url is string => typeof url === 'string');
	//   }

	//   if (typeof product.image_urls === 'object') {
	//     return Object.values(product.image_urls)
	//       .filter((url): url is string => typeof url === 'string');
	//   }

	//   return [];
	// }, [product?.image_urls]);

	if (loading) {
		return (
			<LoaderContainer>
				<Loader />
			</LoaderContainer>
		);
	}

	return (
		<>
			<HeaderContainer>
				<Header text={`${product?.name}`} />
			</HeaderContainer>

			{/* <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Assigned to:</span>
          {selectedUsers.length > 0 ? (
            <div className="flex items-center gap-2">
              {selectedUsers.map((user) => (
                <ProductsSeamstressAvatar
                  key={user.id}
                  user={user}
                  handleDeleteAssignment={handleDeleteAssignment}
                />
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-400">
              No seamstresses assigned
            </span>
          )}
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setTempSelectedUsers(selectedUsers);
              setSearchQuery("");
            }
            setIsDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Assign Seamstresses
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Assign Seamstresses</DialogTitle>
            </DialogHeader>
            <div className="flex-1 flex flex-col min-h-0">
              <div className="space-y-6 flex-1 overflow-y-auto py-4">
                <div
                  className="rounded-lg border shadow-md cursor-pointer"
                  onClick={() => setIsCommandOpen(true)}
                >
                  <div className="flex items-center px-3 py-2 gap-2 text-sm">
                    <Search className="h-4 w-4 text-gray-500 shrink-0" />
                    <input
                      placeholder="Search seamstresses..."
                      value={searchQuery}
                      onChange={(e) => { 
                        setSearchQuery(e.target.value); 
                        e.stopPropagation();
                        setIsCommandOpen(true);}}
                      className="flex-1 outline-none bg-transparent placeholder:text-gray-500"
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
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                  src={
                                    user.image_url || "/placeholder-avatar.jpg"
                                  }
                                  alt={`${user.first_name} ${user.last_name}`}
                                  className="w-full h-full object-cover"
                                  width={32}
                                  height={32}
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">
                                  {user.first_name} {user.last_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {user.location}
                                </p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  )}
                </div>

                {tempSelectedUsers.length > 0 && (
                  <div className="space-y-4 mt-6">
                    <h3 className="font-medium text-sm text-gray-500">
                      Selected Seamstresses
                    </h3>
                    {tempSelectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg group"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={user.image_url || "/placeholder-avatar.jpg"}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-full h-full object-cover"
                            width={48}
                            height={48}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">
                            {user.first_name} {user.last_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {user.location}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 py-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTempSelectedUsers(selectedUsers);
                    setSearchQuery("");
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleConfirmAssignment();
                    setSearchQuery("");
                  }}
                >
                  Confirm Assignment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGeneratePDF}
          disabled={isPdfGenerating}
        >
          {isPdfGenerating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
      </div> */}

			<div className='flex flex-col justify-center items-center gap-4'>
				<div className='w-[80%]'>
					<ProductsImages product={product} />
				</div>
				<div className='w-full'>
					<ProductsDetails product={product} />
				</div>
			</div>			

			{/* {isZoomModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <Image
            src={safeImageUrls[zoomImageIndex] || "/images/placeholder-image.jpg"}
            alt={`${product.name} - zoomed image`}
            className="max-w-full max-h-full object-contain"
            width={2000}
            height={2000}
            priority
            quality={100}
          />
          {safeImageUrls.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium">
              {zoomImageIndex + 1} / {safeImageUrls.length}
            </div>
          )}
        </div>
      )} */}
		</>
	);
}
