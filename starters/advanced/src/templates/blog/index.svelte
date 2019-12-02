<script>
  import { onMount } from "svelte";
  import Layout from "../../components/layout/layout.svelte";

  export let markdown;

  onMount(() => {
    document.getElementById("md-content").innerHTML = markdown.content;
  });
</script>

<Layout>
  <div id="md-content" class="md-content" />
</Layout>
