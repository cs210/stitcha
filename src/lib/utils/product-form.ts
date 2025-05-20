import { UseFormReturn } from 'react-hook-form';
import { Labor, PackagingMaterial, RawMaterial } from '../schemas/global.types';

// Handle the material code change
export const handleMaterialCodeChange = (
    form: UseFormReturn<any>,
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

// Handle the material name change
export const handleMaterialNameChange = (
    form: UseFormReturn<any>,
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

// Handle the packaging material name change
export const handlePackagingMaterialNameChange = (
    form: UseFormReturn<any>,
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

// Handle the packaging material code change
export const handlePackagingMaterialCodeChange = (
    form: UseFormReturn<any>,
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

// Handle the labor change
export const handleLaborChange = (
    form: UseFormReturn<any>,
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