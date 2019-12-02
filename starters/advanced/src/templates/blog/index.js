import Index from "./index.svelte";

document.getElementById("root").innerHTML += `<style>__css__</style>`;
const index = new Index({
  target: document.getElementById("root"),
  props: {
    markdown: __markdown__
  }
});

export default index;
