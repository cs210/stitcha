"use client";

import { useEffect, useState } from "react";
import { Product } from "@/utils/schemas/global.types";
import { Header } from "@/components/custom/header";
import { HeaderContainer } from "@/components/custom/header-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User } from "@/utils/schemas/global.types";

export default function ProductDetails({ params }: { params: { id: string } }) {
  const unwrappedParams = React.use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    async function getProduct() {
      try {
        const response = await fetch(`/api/products/${unwrappedParams.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    getProduct();
  }, [unwrappedParams.id]);

  useEffect(() => {
    async function getUsers() {
      try {
        const response = await fetch("/api/users");
        const { data, error } = await response.json();
        if (!error) {
          setUsers(data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    getUsers();
  }, []);

  const handleUserAssignment = async (userId: string) => {
    try {
      const newSelectedUsers = selectedUsers.includes(userId)
        ? selectedUsers.filter((id) => id !== userId)
        : [...selectedUsers, userId];

      setSelectedUsers(newSelectedUsers);

      // First, update the product-user assignment
      const response = await fetch(
        `/api/products/${product?.id}/assign-users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userIds: newSelectedUsers }),
        }
      );

      // If a new user was added (not removed), send them an SMS notification
      if (!selectedUsers.includes(userId)) {
        const user = users.find((u) => u.id === userId);
        if (user?.phone) {
          await fetch("/api/sendMessages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phoneNumber: user.phone,
              productName: product?.name,
            }),
          });
        }
      }

      const updatedProduct = await fetch(
        `/api/products/${unwrappedParams.id}`
      ).then((res) => res.json());
      setProduct(updatedProduct);
    } catch (error) {
      console.error("Error assigning users:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  const selectedUsersData = users.filter((user) =>
    selectedUsers.includes(user.id)
  );

  return (
    <div className="p-6 pb-12">
      <HeaderContainer className="mb-8">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Header text={product.name} />
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/products/${params.id}/edit`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
        </div>
      </HeaderContainer>

      <div className="grid grid-cols-12 gap-8 max-w-7xl mx-auto">
        {/* Left Column - Product Details */}
        <div className="col-span-8">
          <div className="space-y-6">
            <div>
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-96 object-contain rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <p>
                  <strong>System Code:</strong> {product.system_code}
                </p>
                <p>
                  <strong>Cert Number:</strong> {product.inmetro_cert_number}
                </p>
                <p>
                  <strong>Barcode:</strong> {product.barcode}
                </p>
                <p>
                  <strong>Product Type:</strong> {product.product_type}
                </p>
              </div>
              <div className="space-y-3">
                <p>
                  <strong>Weight:</strong> {product.weight} kg
                </p>
                <p>
                  <strong>Width:</strong> {product.width} cm
                </p>
                <p>
                  <strong>Height:</strong> {product.height} cm
                </p>
                <p>
                  <strong>Lost %:</strong> {product.percent_pieces_lost}%
                </p>
              </div>
            </div>

            <div>
              <p className="font-bold mb-2">Description:</p>
              <p>{product.description}</p>
            </div>
          </div>
        </div>

        {/* Right Column - User Assignment */}
        <div className="col-span-4">
          <div className="bg-gray-50 rounded-lg p-6 min-h-[calc(100vh-8rem)] sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Assigned Users</h2>
            <div className="space-y-4">
              <Select value={""} onValueChange={handleUserAssignment}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select users" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span>
                          {user.first_name} {user.last_name}
                        </span>
                        {selectedUsers.includes(user.id) && (
                          <span className="text-green-500 ml-2">✓</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedUsersData.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {selectedUsersData.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img
                            src={user.image_url || "/placeholder.svg"}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUserAssignment(user.id)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mt-4">
                  No users assigned yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
