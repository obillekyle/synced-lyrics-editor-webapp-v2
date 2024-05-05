<script setup lang="ts"></script>

<template>
  <div class="tag"><slot /></div>
</template>

<style scoped lang="scss">
  .tag {
    height: var(--xl);
    background-color: orangered;
    color: white;
    display: grid;
    place-items: center;
    position: fixed;
    text-transform: uppercase;
    font-weight: 600;
    font-size: var(--font-sm);
    left: -25px;
    top: 15px;
    width: 100px;
    rotate: -45deg;
    z-index: 10;
    transition: opacity 0.3s;
    user-select: none;
    box-shadow: 0 2px 5px #0005;
    &:hover {
      opacity: 0;
    }
  }
</style>
