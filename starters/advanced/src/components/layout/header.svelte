<script>
  import uuid from "uuid";

  let card = {
    itemCount: 4
  };
  let menus = [
    {
      id: uuid.v4(),
      name: "Home",
      url: "/"
    },
    {
      id: uuid.v4(),
      name: "Page 2",
      url: "/page-2"
    },
    {
      id: uuid.v4(),
      name: "Blog",
      url: "/blog"
    },
  ];

  function openCard() {}
  function openSearch() {}
  function openMenu() {}
</script>

<style type="text/scss">
  .header {
    background-color: var(--c-primary);
    color: var(--c-white);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 40px;
    display: flex;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.15);
    z-index: 99;
  }

  .menus {
    display: flex;
    margin: auto 0;
    margin-left: 10px;
    height: 40px;
  }

  .menus a {
    font-weight: bold;
    font-size: 12pt;
    text-decoration: none;
    color: var(--c-white);
    margin-right: 30px;
  }

  .menus a .menu {
    height: 40px;
    padding-top: 8px;
  }

  .menus a .menu:hover {
    border-bottom-color: var(--c-neutral);
    border-bottom-style: solid;
    border-bottom-width: 5px;
    transition: 0.2s;
  }
</style>

<div class="header">
  <div class="menus">
    {#each menus as menu}
      <a key={menu.id} href={menu.url}>
        <div class="menu">{menu.name}</div>
      </a>
    {/each}
  </div>
</div>
