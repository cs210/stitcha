import { UseFormReturn } from 'react-hook-form';
import { Labor, PackagingMaterial, RawMaterial } from '../schemas/global.types';
import { ProductFormData } from '@/app/dashboard/products/new/page';

export const handleMaterialCodeChange = (
    form: UseFormReturn<ProductFormData>,
    materials: RawMaterial[],
    index: number,
    value: string
) => {
    const selectedMaterial = materials.find((m) => m.code === value);

    if (selectedMaterial) {
        form.setValue(`materials.${index}.name`, selectedMaterial.name || '');

        if (selectedMaterial.purchase_price) {
            form.setValue(`materials.${index}.purchase_price`, selectedMaterial.purchase_price);
        }
        if (selectedMaterial.units) {
            form.setValue(`materials.${index}.units`, selectedMaterial.units);
        }
    }

    form.setValue(`materials.${index}.code`, value);
};

export const handleMaterialNameChange = (
    form: UseFormReturn<ProductFormData>,
    materials: RawMaterial[],
    index: number,
    value: string
) => {
    const selectedMaterial = materials.find((m) => m.name === value);

    if (selectedMaterial) {
        form.setValue(`materials.${index}.code`, selectedMaterial.code || '');

        if (selectedMaterial.purchase_price) {
            form.setValue(`materials.${index}.purchase_price`, selectedMaterial.purchase_price);
        }
        if (selectedMaterial.units) {
            form.setValue(`materials.${index}.units`, selectedMaterial.units);
        }
    }

    form.setValue(`materials.${index}.name`, value);
};

export const handlePackagingMaterialNameChange = (
    form: UseFormReturn<ProductFormData>,
    packagingMaterials: PackagingMaterial[],
    index: number,
    value: string
) => {
    const selectedMaterial = packagingMaterials.find((m) => m.name === value);

    if (selectedMaterial) {
        form.setValue(`packaging_materials.${index}.code`, selectedMaterial.code || '');

        if (selectedMaterial.purchase_price) {
            form.setValue(`packaging_materials.${index}.purchase_price`, selectedMaterial.purchase_price);
        }
        if (selectedMaterial.units) {
            form.setValue(`packaging_materials.${index}.units`, selectedMaterial.units);
        }
    }

    form.setValue(`packaging_materials.${index}.name`, value);
};

export const handlePackagingMaterialCodeChange = (
    form: UseFormReturn<ProductFormData>,
    packagingMaterials: PackagingMaterial[],
    index: number,
    value: string
) => {
    const selectedMaterial = packagingMaterials.find((m) => m.code === value);

    if (selectedMaterial) {
        form.setValue(`packaging_materials.${index}.name`, selectedMaterial.name || '');

        if (selectedMaterial.purchase_price) {
            form.setValue(`packaging_materials.${index}.purchase_price`, selectedMaterial.purchase_price);
        }
        if (selectedMaterial.units) {
            form.setValue(`packaging_materials.${index}.units`, selectedMaterial.units);
        }
    }

    form.setValue(`packaging_materials.${index}.code`, value);
};

export const handleLaborChange = (
    form: UseFormReturn<ProductFormData>,
    labor: Labor[],
    index: number,
    value: string
) => {
    const selectedLabor = labor.find((l) => l.task === value);

    if (selectedLabor) {
        form.setValue(`labor.${index}.cost_per_minute`, selectedLabor.cost_per_minute);
    }

    form.setValue(`labor.${index}.task`, value);
}; 