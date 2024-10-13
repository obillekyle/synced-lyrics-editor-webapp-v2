<script setup lang="ts"></script>

<template>
  <div class="tag"><slot /></div>
</template>

<style scoped lang="scss">
  .tag {
    height: var(--xl);
    background-color: var(--primary-20);
    display: grid;
    place-items: center;
    position: fixed;
    text-transform: uppercase;
    font-weight: 600;
    font-size: var(--font-sm);
    left: -2.5rem;
    top: 0.75rem;
    width: 7.5rem;
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
