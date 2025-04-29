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
}

interface UpdatePartData {
    id: string;
    units_completed: number;
    seamstress_id: string;
}

export function ProductParts({ productId, productName, orderQuantity }: ProductPartsProps) {
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
        seamstress_id: ''
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
                    total_units: orderQuantity,
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

        // Just set the update state without making an API call
        setUpdatePart({
            id: partId,
            units_completed: part.units_completed,
            seamstress_id: part.seamstress_id || ''
        });
        setIsUpdatingPart(true);
    };

    const handleSaveUpdate = async () => {
        try {
            console.log("UPDATE PART", updatePart);
            const response = await fetch(`/api/products/${productId}/parts/${updatePart.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    units_completed: updatePart.units_completed,
                    seamstress_id: updatePart.seamstress_id || null
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
                    <h3 className="text-lg font-semibold">{productName}</h3>
                    <span className="bg-black text-white text-sm px-2 py-1 rounded">
                        {orderQuantity} units
                    </span>
                </div>
                <Button variant="outline" onClick={() => window.location.href = `/dashboard/products/${productId}`}>
                    View Details
                </Button>
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm text-gray-600">
                        {completedParts} of {totalParts} parts completed
                    </span>
                </div>
                <Progress value={progressPercentage} />
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Parts</h4>
                    <Dialog open={isAddingPart} onOpenChange={setIsAddingPart}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Add Part</Button>
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
                                        value={newPart.units}
                                        onChange={(e) => setNewPart({ ...newPart, units: parseInt(e.target.value) })}
                                        placeholder="Number of total units"
                                        type="number"
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
                                    Completed
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {parts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                        No parts added yet
                                    </td>
                                </tr>
                            ) : (
                                parts.map((part) => (
                                    <tr key={`part-${part.id}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {part.part_name}
                                                </div>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                            {part.units_completed}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Progress 
                                                value={(part.units_completed / part.total_units) * 100}
                                                className="w-24"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleUpdatePart(part.part_id)}
                                            >
                                                Update
                                            </Button>
                                        </td>
                                    </tr>
                                ))
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
                            <Label>Completed Units</Label>
                            <Input
                                type="number"
                                value={updatePart.units_completed}
                                onChange={(e) => setUpdatePart({
                                    ...updatePart,
                                    units_completed: Math.min(
                                        Math.max(0, parseInt(e.target.value) || 0),
                                        orderQuantity
                                    )
                                })}
                                min={0}
                                max={orderQuantity}
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