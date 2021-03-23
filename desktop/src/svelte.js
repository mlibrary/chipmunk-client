import App from './App.svelte';
import "../node_modules/@umich-lib/css/dist/umich-lib.css";

const app = new App({
	target: document.querySelector('main'),
	props: {
		name: 'world'
	}
});

export default app;
