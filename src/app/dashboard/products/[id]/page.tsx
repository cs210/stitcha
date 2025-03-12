"use client";

import { Header } from "@/components/custom/header";
import { HeaderContainer } from "@/components/custom/header-container";
import { Loader } from "@/components/custom/loader";
import { LoaderContainer } from "@/components/custom/loader-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Product, Progress, User } from "@/lib/schemas/global.types";
import { Check, Search, Users, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProductDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [tempSelectedUsers, setTempSelectedUsers] = useState<User[]>([]);
  const [progressUpdates, setProgressUpdates] = useState<Progress[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCommandOpen, setIsCommandOpen] = useState(false);

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
        const productResponse = await fetch(
          `/api/products/${unwrappedParams.id}`
        );
        const productData = await productResponse.json();

        if (!productResponse.ok) {
          throw new Error(productData.error);
        }

        setProduct(productData);

        // Fetch all available seamstresses
        const usersResponse = await fetch("/api/seamstresses");
        const { data: usersData } = await usersResponse.json();

        if (Array.isArray(usersData)) {
          setUsers(usersData);
        }

        // Fetch assigned seamstresses for this product
        const assignedResponse = await fetch(
          `/api/products/${unwrappedParams.id}/assigned`
        );
        const { data: assignedData } = await assignedResponse.json();

        if (Array.isArray(assignedData)) {
          // Find the full user objects for assigned seamstresses
          const assignedUsers = usersData.filter((user) =>
            assignedData.some((assigned) => assigned.user_id === user.id)
          );
          setSelectedUsers(assignedUsers);
          setTempSelectedUsers(assignedUsers);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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
        console.log(
          "Fetching timeline updates for product:",
          unwrappedParams.id
        );

        const response = await fetch(
          `/api/products/${unwrappedParams.id}/timeline`
        );
        const { data } = await response.json();

        console.log("Fetched timeline data:", data);

        if (Array.isArray(data)) {
          // Add the created event if it doesn't exist
          const updates = [...data];
          if (!updates.some((update) => update.emotion === "created")) {
            updates.unshift({
              id: "created",
              created_at: "2025-03-10T13:20:00.000Z", // Hardcoded date
              description: `Batch #${
                product.batch_number || "2024-001"
              } entered production phase`,
              emotion: "created",
              user_id: "system",
              image_urls: [],
            });
          }
          setProgressUpdates(updates);
        }
      } catch (error) {
        console.error("Error fetching timeline:", error);
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
    setTempSelectedUsers(
      tempSelectedUsers.filter((user) => user.id !== userId)
    );
  };

  const handleConfirmAssignment = async () => {
    try {
      console.log("Attempting to assign seamstresses:", {
        productId: unwrappedParams.id,
        seamstressIds: tempSelectedUsers.map((user) => user.id),
      });

      const response = await fetch(
        `/api/products/${unwrappedParams.id}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seamstressIds: tempSelectedUsers.map((user) => user.id),
          }),
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign seamstresses");
      }

      // Find newly assigned users (for the progress update)
      const newlyAssignedUsers = tempSelectedUsers.filter(
        (tempUser) =>
          !selectedUsers.some((selectedUser) => selectedUser.id === tempUser.id)
      );

      // Create progress event if there are new assignments
      if (newlyAssignedUsers.length > 0) {
        const newEvent: Progress = {
          id: `assigned-${Date.now()}`,
          created_at: new Date().toISOString(),
          description:
            newlyAssignedUsers.length === 1
              ? `Product assigned to ${newlyAssignedUsers[0].first_name} ${newlyAssignedUsers[0].last_name}`
              : `Product assigned to ${newlyAssignedUsers
                  .map((user) => `${user.first_name} ${user.last_name}`)
                  .join(", ")}`,
          emotion: "assigned",
          user_id: newlyAssignedUsers.map((user) => user.id).join(","),
          image_urls: [],
        };

        setProgressUpdates((prev) => [...(prev || []), newEvent]);
      }

      // Update UI state
      setSelectedUsers(tempSelectedUsers);
      setIsDialogOpen(false);
      toast.success("Seamstresses assigned successfully");
    } catch (error) {
      console.error("Error in handleConfirmAssignment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to assign seamstresses"
      );
    }
  };

  const handleDeleteAssignment = async (userId: string) => {
    try {
      const response = await fetch(
        `/api/products/${unwrappedParams.id}/assign`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seamstressIds: [userId], // Send as array since the API expects an array
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove assignment");
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
          emotion: "unassigned",
          user_id: userId,
          image_urls: [],
        };

        setProgressUpdates((prev) => [...(prev || []), newEvent]);
      }

      toast.success("Assignment removed successfully");
    } catch (error) {
      console.error("Error removing assignment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to remove assignment"
      );
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
      (searchQuery === "" ||
        `${user.first_name} ${user.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (user.location?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ))
  );

  return (
    <>
      <HeaderContainer>
        <Header text={product.name} />
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Assigned to:</span>
            {selectedUsers.length > 0 ? (
              <div className="flex items-center gap-2">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="group relative">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                      <Image
                        src={user.image_url || "/placeholder-avatar.jpg"}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-full h-full object-cover"
                        width={32}
                        height={32}
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteAssignment(user.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title={`Remove ${user.first_name} ${user.last_name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCommandOpen(true);
                        }}
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
                                      user.image_url ||
                                      "/placeholder-avatar.jpg"
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
        </div>
      </HeaderContainer>

      <div className="py-4 space-y-4">
        <div className="grid grid-cols-[2fr,1fr] gap-4">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <Image
                src={
                  product.image_urls && product.image_urls.length > 0
                    ? product.image_urls[0]
                    : "/placeholder-image.jpg"
                }
                alt={product.name}
                className="w-full h-64 object-contain rounded-lg mb-8"
                width={100}
                height={100}
              />
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">
                    Product Information
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-baseline">
                      <span className="text-gray-500 w-32">System Code</span>
                      <span className="font-medium">{product.system_code}</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-gray-500 w-32">Cert Number</span>
                      <span className="font-medium">
                        {product.inmetro_cert_number}
                      </span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-gray-500 w-32">Barcode</span>
                      <span className="font-medium">{product.barcode}</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-gray-500 w-32">Product Type</span>
                      <span className="font-medium">
                        {product.product_type}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-4">
                    Specifications
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-baseline">
                      <span className="text-gray-500 w-32">Weight</span>
                      <span className="font-medium">{product.weight} kg</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-gray-500 w-32">Width</span>
                      <span className="font-medium">{product.width} cm</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-gray-500 w-32">Height</span>
                      <span className="font-medium">{product.height} cm</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-gray-500 w-32">Lost %</span>
                      <span className="font-medium">
                        {product.percent_pieces_lost}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="text-gray-500">{product.description}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border">
            <h2 className="text-2xl font-semibold mb-8">Activity Timeline</h2>
            <div className="relative">
              {progressUpdates && progressUpdates.length > 1 && (
                <div className="absolute left-[7px] top-[24px] bottom-[64px] w-[2px] bg-gray-200" />
              )}

              <div className="space-y-12">
                {progressUpdates && progressUpdates.length > 0 ? (
                  [...progressUpdates]
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .map((update, index) => (
                      <div key={update.id} className="relative pl-8">
                        <div className="absolute left-0 top-[6px] w-4 h-4 rounded-full bg-black" />
                        <div>
                          <h3 className="text-lg font-medium">
                            {update.emotion === "created"
                              ? "Product Created"
                              : "Seamstress Assigned"}
                          </h3>
                          <p className="text-gray-500 mt-1">
                            {update.description}
                          </p>
                          <p className="text-gray-500 mt-1">
                            {new Date(update.created_at)
                              .toLocaleString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })
                              .replace(",", "")}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500">No activity recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
