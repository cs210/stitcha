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

export default function ProductDetails({ params }: { params: { id: string } }) {
  const unwrappedParams = React.use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [seamstresses, setSeamstresses] = useState<any[]>([]);
  const [selectedSeamstress, setSelectedSeamstress] = useState("");
  const [isLoadingSeamstresses, setIsLoadingSeamstresses] = useState(true);

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
    async function getSeamstresses() {
      setIsLoadingSeamstresses(true);
      try {
        const response = await fetch("/api/seamstresses");
        const data = await response.json();
        setSeamstresses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching seamstresses:", error);
        setSeamstresses([]);
      } finally {
        setIsLoadingSeamstresses(false);
      }
    }

    getSeamstresses();
  }, []);

  const handleSeamstressAssignment = async (seamstressId: string) => {
    try {
      const response = await fetch(
        `/api/products/${unwrappedParams.id}/assign`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ seamstressId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign seamstress");
      }

      setSelectedSeamstress(seamstressId);
    } catch (error) {
      console.error("Error assigning seamstress:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

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

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-96 object-contain rounded-lg"
            />
          </div>
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
          <div className="col-span-2">
            <p className="font-bold mb-2">Description:</p>
            <p>{product.description}</p>
          </div>
          <div className="space-y-3">
            <div className="mt-6">
              <Label htmlFor="seamstress-select">Assign Seamstress</Label>
              <Select
                value={selectedSeamstress}
                onValueChange={handleSeamstressAssignment}
                disabled={isLoadingSeamstresses}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingSeamstresses
                        ? "Loading seamstresses..."
                        : "Select a seamstress"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {seamstresses.length === 0 && !isLoadingSeamstresses && (
                    <SelectItem value="none" disabled>
                      No seamstresses available
                    </SelectItem>
                  )}
                  {seamstresses.map((seamstress) => (
                    <SelectItem key={seamstress.id} value={seamstress.id}>
                      {seamstress.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
