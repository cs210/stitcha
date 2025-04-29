import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Seamstress {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface Part {
    id: string;
    part_id: string;
    part_name: string;
    units_completed: number;
    total_units: number;
    seamstress_id: string | null;
    product_id: string;
    created_at: string;
    updated_at: string;
}

interface ProductPartsProps {
    productId: string;
    productName: string;
    orderQuantity: number;
    orderId: string;
    onProductRemoved?: () => void;
}

interface UpdatePartData {
    id: string;
    units_completed: number;
    total_units: number;
    seamstress_id: string;
    part_name: string;
}

// Add a helper function to determine part status
const getPartStatus = (completedUnits: number, totalUnits: number) => {
    if (completedUnits === 0) return 'Not Started';
    if (completedUnits === totalUnits) return 'Completed';
    return 'In Progress';
};

// Add a helper function to get status color
const getStatusColor = (status: string) => {
    switch (status) {
        case 'Completed':
            return 'bg-green-100 text-green-800';
        case 'In Progress':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export function ProductParts({ productId, productName, orderQuantity, orderId, onProductRemoved }: ProductPartsProps) {
    const [parts, setParts] = useState<Part[]>([]);
    const [seamstresses, setSeamstresses] = useState<Seamstress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddingPart, setIsAddingPart] = useState(false);
    const [newPart, setNewPart] = useState({
        name: '',
        units: orderQuantity,
        seamstress_id: '',
    });
    const [isUpdatingPart, setIsUpdatingPart] = useState(false);
    const [updatePart, setUpdatePart] = useState<UpdatePartData>({
        id: '',
        units_completed: 0,
        total_units: 0,
        seamstress_id: '',
        part_name: '',
    });

    // Fetch parts and seamstresses data
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch parts from Supabase
                const partsResponse = await fetch(`/api/products/${productId}/parts`);
                if (!partsResponse.ok) {
                    throw new Error('Failed to fetch parts');
                }
                const partsData = await partsResponse.json();
                
                if (partsData.error) {
                    throw new Error(partsData.error);
                }
                
                setParts(partsData.data || []);
                console.log("PARTS (AFTER SET PARTS)", partsData.data);

                // Fetch seamstresses
                const seamstressesResponse = await fetch('/api/seamstresses');
                if (!seamstressesResponse.ok) {
                    throw new Error('Failed to fetch seamstresses');
                }
                const seamstressesData = await seamstressesResponse.json();
                
                if (seamstressesData.error) {
                    throw new Error(seamstressesData.error);
                }
                
                setSeamstresses(seamstressesData.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [productId]);

    const handleAddPart = async () => {
        try {
            const response = await fetch(`/api/products/${productId}/parts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newPart.name,
                    total_units: newPart.units,
                    seamstress_id: newPart.seamstress_id || null,
                    units_completed: 0
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add part');
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            setParts([...parts, data.data]);
            setIsAddingPart(false);
            setNewPart({ name: '', units: orderQuantity, seamstress_id: '' });
        } catch (error) {
            console.error('Error adding part:', error);
            setError(error instanceof Error ? error.message : 'Failed to add part');
        }
    };

    const handleUpdatePart = async (partId: string) => {
        const part = parts.find(p => p.part_id === partId);
        if (!part) return;

        // Initialize the update state with existing values
        setUpdatePart({
            id: partId,
            units_completed: part.units_completed || 0,
            total_units: part.total_units || 0,
            seamstress_id: part.seamstress_id || '',
            part_name: part.part_name || '',
        });
        setIsUpdatingPart(true);
    };

    const handleSaveUpdate = async () => {
        try {
            // Only send the update if values have changed and completed units don't exceed total
            const part = parts.find(p => p.part_id === updatePart.id);
            if (!part) return;

            // Ensure completed units don't exceed total units
            const cappedCompletedUnits = Math.min(updatePart.units_completed, updatePart.total_units);
            
            // Check if any values have actually changed
            if (
                part.units_completed === cappedCompletedUnits &&
                part.total_units === updatePart.total_units &&
                part.seamstress_id === (updatePart.seamstress_id || null) &&
                part.part_name === updatePart.part_name
            ) {
                setIsUpdatingPart(false);
                return;
            }

            console.log("UPDATE PART", updatePart);
            const response = await fetch(`/api/products/${productId}/parts/${updatePart.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    units_completed: cappedCompletedUnits,
                    total_units: updatePart.total_units,
                    seamstress_id: updatePart.seamstress_id || null,
                    part_name: updatePart.part_name,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update part');
            }

            const { data, error } = await response.json();
            if (error) {
                throw new Error(error);
            }

            // Update the parts state with the updated part
            setParts(parts.map(p => p.part_id === updatePart.id ? { ...p, ...data } : p));
            setIsUpdatingPart(false);
        } catch (error) {
            console.error('Error updating part:', error);
            setError(error instanceof Error ? error.message : 'Failed to update part');
        }
    };

    const handleDeletePart = async (partId: string) => {
        try {
            const response = await fetch(`/api/products/${productId}/parts/${partId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete part');
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            // Remove the deleted part from state
            setParts(parts.filter(p => p.part_id !== partId));
        } catch (error) {
            console.error('Error deleting part:', error);
            setError(error instanceof Error ? error.message : 'Failed to delete part');
        }
    };

    const handleRemoveProduct = async () => {
        try {
            // First get current product IDs
            const response = await fetch(`/api/orders/${orderId}/products`);
            const data = await response.json();
            
            if (!data.product_ids) {
                throw new Error('No product IDs found');
            }
            
            // Filter out the current product
            const updatedProductIds = data.product_ids.filter((id: string) => id !== productId);
            
            // Update the order with new product IDs
            const updateResponse = await fetch(`/api/orders/${orderId}/products`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_ids: updatedProductIds
                }),
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to remove product');
            }

            // Notify parent component
            onProductRemoved?.();
        } catch (error) {
            console.error('Error removing product:', error);
            setError(error instanceof Error ? error.message : 'Failed to remove product');
        }
    };

    // Calculate total progress
    const totalParts = parts.reduce((sum, part) => sum + part.total_units, 0);
    const completedParts = parts.reduce((sum, part) => sum + part.units_completed, 0);
    const progressPercentage = totalParts > 0 ? (completedParts / totalParts) * 100 : 0;

    if (isLoading) {
        return <div className="flex items-center justify-center p-4">Loading parts...</div>;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-4 text-red-500">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{productName}</h3>
                    <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                        {orderQuantity} units
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => window.location.href = `/dashboard/products/${productId}`}
                    >
                        View Details
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="lg"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleRemoveProduct}
                    >
                        Remove
                    </Button>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-base text-gray-600">Progress</span>
                    <span className="text-sm text-gray-600">
                        {completedParts} of {totalParts} parts completed ({Math.round(progressPercentage)}%)
                    </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium">Parts</h4>
                    <Dialog open={isAddingPart} onOpenChange={setIsAddingPart}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="lg">Add Part</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Part</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Part Name</Label>
                                    <Input
                                        value={newPart.name}
                                        onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                                        placeholder="Enter name of part"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Total Units</Label>
                                    <Input
                                        value={newPart.units === 0 ? '' : String(newPart.units)}
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                                            if (!isNaN(value)) {
                                                setNewPart({ ...newPart, units: value });
                                            }
                                        }}
                                        placeholder="Number of total units"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Assign To</Label>
                                    <Select
                                        value={newPart.seamstress_id}
                                        onValueChange={(value) => setNewPart({ ...newPart, seamstress_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a seamstress" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {seamstresses.map((seamstress) => (
                                                <SelectItem key={`new-${seamstress.id}`} value={seamstress.id}>
                                                    {seamstress.first_name} {seamstress.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleAddPart}>Add Part</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Part Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Assigned To
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Units
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Progress
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {parts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        No parts added yet
                                    </td>
                                </tr>
                            ) : (
                                parts.map((part) => {
                                    const status = getPartStatus(part.units_completed, part.total_units);
                                    return (
                                        <tr key={`part-${part.part_id}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {part.part_name}
                                                    </div>
                                                    <Badge variant="secondary" className={getStatusColor(status)}>
                                                        {status}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {part.seamstress_id ? (
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                            {seamstresses.find(s => s.id === part.seamstress_id)?.first_name.charAt(0)}
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="font-medium text-gray-900">
                                                                {seamstresses.find(s => s.id === part.seamstress_id)?.first_name} {seamstresses.find(s => s.id === part.seamstress_id)?.last_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {seamstresses.find(s => s.id === part.seamstress_id)?.role}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                {part.total_units}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex-1 min-w-[200px] max-w-[300px] mr-4">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm text-gray-500">
                                                                {part.units_completed} of {part.total_units}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {Math.round((part.units_completed / part.total_units) * 100)}%
                                                            </span>
                                                        </div>
                                                        <Progress value={(part.units_completed / part.total_units) * 100} className="h-2" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => handleUpdatePart(part.part_id)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDeletePart(part.part_id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={isUpdatingPart} onOpenChange={setIsUpdatingPart}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Part Progress</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Part Name</Label>
                            <Input
                                value={updatePart.part_name}
                                onChange={(e) => setUpdatePart({ ...updatePart, part_name: e.target.value })}
                                placeholder="Enter name of part"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Total Units</Label>
                            <Input
                                value={updatePart.total_units?.toString() || '0'}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                                    if (!isNaN(value)) {
                                        setUpdatePart({
                                            ...updatePart,
                                            total_units: value
                                        });
                                    }
                                }}
                                placeholder="Number of total units"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Completed Units</Label>
                            <Input
                                value={updatePart.units_completed?.toString() || '0'}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                                    if (!isNaN(value)) {
                                        setUpdatePart({
                                            ...updatePart,
                                            units_completed: Math.min(value, updatePart.total_units)
                                        });
                                    }
                                }}
                                placeholder="Number of completed units"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Assign To</Label>
                            <Select
                                value={updatePart.seamstress_id}
                                onValueChange={(value) => setUpdatePart({
                                    ...updatePart,
                                    seamstress_id: value
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a seamstress" />
                                </SelectTrigger>
                                <SelectContent>
                                    {seamstresses.map((seamstress) => (
                                        <SelectItem key={`update-${seamstress.id}`} value={seamstress.id}>
                                            {seamstress.first_name} {seamstress.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleSaveUpdate}>Save Changes</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 