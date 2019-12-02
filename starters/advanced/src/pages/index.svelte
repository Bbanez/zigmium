<script>
  import Layout from "../components/layout/layout.svelte";

  export let message;
</script>

<Layout>
  <h1>{message}</h1>
  <p>
    Welcome to your first site created with
    <a href="https://svelte.dev/">Svelte</a>
    and
    <a href="https://github.com/Bbanez/purple-lightning">Purple Lightning</a>
    . Main advantage of this framework is that it is creating very small bundles
    and entire page is inside 1 HTML file. Thanks to Svelte, there is no virtual
    DOM and site is lightning fast.
  </p>
</Layout>
