<script>
  import Header from './header.svelte';
  import Footer from './footer.svelte';
</script>

<style lang="scss" global>
  @import '../../styles/global.scss';
  @import '../../styles/reset.scss';

  .layout {
    display: flex;
    flex-direction: column;
    background-color: var(--c-neutral);
    min-height: 100vh;
  }

  .container {
    padding: 50px 20px;
    width: 900px;
    margin: 0 auto;
    margin-top: 50px;
  }
</style>

<div class="layout">
  <Header />
  <div class="container">
    <slot>
      <layout />
    </slot>
  </div>
  <Footer />
</div>