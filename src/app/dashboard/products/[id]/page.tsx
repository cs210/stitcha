export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const id = (await params).id;

	// const { user } = useUser();
	const response = await fetch(`/api/products/${id}/progress`);

	// const [loading, setLoading] = useState<boolean>(false);
	// const [product, setProduct] = useState<Product>();

	// useEffect(() => {
	// 	if (!user) return;

	// 	// Anonymous function to fetch products from Supabase
	// 	(async () => {
	// 		setLoading(true);

	// 		const { data, error } = await response.json();

	// 		console.log(data);

	// 		// if (!error) {
	// 		// 	setProduct(data);
	// 		// }

	// 		setLoading(false);
	// 	})();
	// }, [user]);

	// Loading state
	// if (loading) return <Loader />;

	return (
		<div>
			<h1>Product {id}</h1>
			<pre>{JSON.stringify(response, null, 2)}</pre>
		</div>
	);
}
