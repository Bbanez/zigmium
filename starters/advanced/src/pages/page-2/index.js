import Index from './index.svelte';

document.getElementById('root').innerHTML += `<style>__css__</style>`;
const index = new Index({
  target: document.getElementById('root'),
  props: {
    // Variable __pageInfo__ will be available in pl-node.js
    pageInfo: __pageInfo__
  }
});

export default index;
