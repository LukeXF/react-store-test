import React, { Fragment, useEffect, useState } from 'react';

const Input = () => {
	const [value, setValue] = useState("");


	const branches = [1, 2, 3];

	useEffect(() => {
		async function loadProducts() {
			const api = await Promise.all(
				branches.map(async branch => {
					const response = await fetch(`/api/branch${branch}.json`);
					const { products } = await response?.json();
					return products;
				})
			);

			// console.log(api);
			return combineProducts(api);
		}

		loadProducts();
	}, [value]);

	// console.log(api);
	// const test = fetch('https://api.github.com/users/hacktivist123/repos')
	// 	.then(response => response.json())
	// 	.then(data => console.log(data));

	return (
		<Fragment>
			<div>value: {value}</div>
			<input value={value} onChange={e => setValue(e.target.value)}/>
		</Fragment>
	);
}

function combineProducts(BranchesProducts) {
	console.log(2, BranchesProducts);
}
export default Input;
