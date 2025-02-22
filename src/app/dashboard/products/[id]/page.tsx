export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const id = (await params).id;

	return (
		<div>
			<h1>Product {id}</h1>
		</div>
	);
}
