import Index from './index.svelte';

document.getElementById('root').innerHTML += `<style>__css__</style>`;
const index = new Index({
	target: document.getElementById('root'),
	props: {
		message: 'Hello World'
	}
});

export default index;
