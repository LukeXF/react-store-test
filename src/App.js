import React, { useState, useEffect } from "react";
// import Input from './components/Input';
import "./App.css";

const formatNumber = (number) => new Intl.NumberFormat("en", { minimumFractionDigits: 2 }).format(number);

const App = () => {
	const [value, setValue] = useState("");
	const [total, setTotal] = useState(0);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	const branches = [1, 2, 3];

	async function loadProducts(branches, searchValue) {
		const api = await Promise.all(
			branches.map(async branch => {
				const response = await fetch(`/api/branch${branch}.json`);
				const { products } = await response?.json();
				return products;
			})
		);

		const p = combineProducts([...api[0], ...api[1], ...api[2]], searchValue);
		p.sort((a, b) => a.name.localeCompare(b.name))

		setProducts(p);
		setTotal(buildTotal(p));
		setLoading(false);
	}

	useEffect(() => {
		loadProducts(branches);
	}, []);

	useEffect(() => {
		loadProducts(branches, value);
	}, [value]);

	return loading ? <div>Loading...</div> : (
		<div class="product-list">
			<label>
				Search {products.length} Product{products.length > 0 ? 's' : ''}
			</label>
			{value}
			<input value={value} onChange={e => setValue(e.target.value)}/>

			<table>
				<thead>
				<tr>
					<th>Product</th>
					<th>Revenue</th>
				</tr>
				</thead>
				<tbody>
				{products.map(product =>
					<tr key={product.name}>
						<td>{product.name}</td>
						<td>{formatNumber(product.sold)}</td>
					</tr>
				)}
				</tbody>
				<tfoot>
				<tr>
					<td>Total</td>
					<td>{formatNumber(total)}</td>
				</tr>
				</tfoot>
			</table>
		</div>
	);
}


function buildTotal(products) {
	console.log('buildTotal');
	return products.reduce(function (acc, { sold, unitPrice }) {
		return acc + (sold * unitPrice);
	}, 0);
}

function combineProducts(BranchesProducts, searchValue) {
	return BranchesProducts.reduce((allProducts, { id, name, unitPrice, sold }) => {
		const existing = allProducts.filter(product => id === product.id);
		if (searchValue && name.toLowerCase().indexOf(searchValue.toLowerCase()) === -1) return allProducts;

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
			allProducts.push({ id, sold, name, unitPrice });
		}
		return allProducts;
	}, [])
}

export default App;
