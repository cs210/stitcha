import { Button } from "@/components/ui/button";

// Container element to surround form elements
export function FormContainer({ dict, onSubmit, children }: { dict: any, onSubmit: (values: any) => void, children: React.ReactNode }) {
	return (
		<form onSubmit={onSubmit} className='space-y-8 w-full'>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>{children}</div>

			<Button type='submit'>{dict.products.new.submit}</Button>
		</form>
	);
}