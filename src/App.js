import React, { useState, useEffect } from "react";
// import Input from './components/Input';
import "./App.css";

const formatNumber = (number) => new Intl.NumberFormat("en", { minimumFractionDigits: 2 }).format(number);

const App = () => {
	const [value, setValue] = useState("");
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [sortBy, setSortBy] = useState('asc');

	const branches = [1, 2, 3];

	const total = buildTotal(products);

	async function buildProducts(branches) {
		// set products from state if populated already, else call API
		let p = !loading ? products : await loadProductsFromApi(branches);

		setProducts(p);
		setLoading(false);
	}

	useEffect(() => {
		buildProducts(branches);
	}, []);

	useEffect(() => {
		buildProducts(branches);
	}, [value]);

	const onClick = async (e) => {
		e.preventDefault();
		await setSortBy(sortBy === 'asc' ? 'desc' : 'asc');
	};

	const filteredProducts = products.filter(
		product => value ? product?.name?.toLowerCase().indexOf(value.toLowerCase()) !== -1 : true
	);

	return loading ? <div>Loading...</div> : (
		<div className={"product-list"}>
			<label>
				Search {products.length} Product{products.length > 0 ? 's' : ''}
			</label>
			<input value={value} onChange={e => setValue(e.target.value)}/>

			<table>
				<thead>
				<tr>
					<th onClick={onClick} className={"product-title"}>
						<div>Product</div>
						<div>({`${sortBy}ending order`})</div>
					</th>
					<th>Revenue</th>
				</tr>
				</thead>
				<tbody>
				{
					// sort filtered (by name) products by asc/desc order, then map over to display
					filteredProducts.sort(
					(a, b) => sortBy !== 'asc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
				).map(sortedProduct => (
					<tr key={sortedProduct.name}>
						<td>{sortedProduct.name}</td>
						<td>{formatNumber(sortedProduct.sold)}</td>
					</tr>
				))}
				</tbody>
				<tfoot>
				<tr>
					<td>Total</td>
					<td>{formatNumber(buildTotal(filteredProducts))}</td>
				</tr>
				</tfoot>
			</table>
		</div>
	);
}

async function loadProductsFromApi(branches) {
	console.log('loaded from API');
	// dynamically maps through given IDs
	const branchData = await Promise.all(
		branches.map(async branch => {
			const response = await fetch(`/api/branch${branch}.json`);
			const { products } = await response?.json();
			return products;
		})
	);
	// TODO: make destructure dynamic like above
	const branchesProducts = [...branchData[0], ...branchData[1], ...branchData[2]];

	return branchesProducts.reduce((allProducts, { id, name, unitPrice, sold }) => {
		// find if currently looped product already exists in allProducts
		const existing = allProducts.filter(product => id === product.id);

		// if existing value is found, then add new sold amount to existing sold amount
		if (existing?.length > 0) {
			return allProducts.map(product => {
				return product.id === id ? {
					id: product.id,
					sold: product.sold + sold,
					name: product.name,
					unitPrice: product.unitPrice
				} : product;
			})
		} else {
			// else doesn't exist, add to array
			allProducts.push({ id, sold, name, unitPrice });
		}
		return allProducts;
	}, [])
}

function buildTotal(products) {
	// loop through all products and combine units sold by unit price
	return products.reduce(function (acc, { sold, unitPrice }) {
		return acc + (sold * unitPrice);
	}, 0);
}

export default App;
