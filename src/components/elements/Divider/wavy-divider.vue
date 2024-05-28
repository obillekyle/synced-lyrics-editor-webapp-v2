<script setup lang="ts"></script>

<template>
  <div class="wavy-divider">
    <svg
      width="100%"
      height="12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <pattern
        id="squiggle"
        width="36"
        height="12"
        patternUnits="userSpaceOnUse"
      >
        <g clip-path="url(#clip0_1_8)">
          <path
            d="M0 1.55556C9 1.55556 9 10.4444 18 10.4444C27 10.4444 27 1.55556 36 1.55556"
            stroke="currentColor"
            stroke-width="2"
          />
        </g>
      </pattern>

      <rect width="100%" height="100%" fill="url(#squiggle)"></rect>
    </svg>
  </div>
</template>

<style lang="scss">
  .wavy-divider {
    width: 100%;
    color: var(--color-300-50);
    margin-block: var(--lg);
    padding: var(--md);
  }
</style>
