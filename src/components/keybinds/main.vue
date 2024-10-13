<script setup lang="ts">
import { $, debounce, evaluate } from "@vue-material/core";
import { onMounted, onUnmounted, ref, reactive } from "vue";
import { KeyboardGuides, type BindItems, as } from "./keys";
import entry from "./entry.vue";
import { useScreen } from "@/hooks/use-screen";

const keyActive = reactive({
	ctrl: false,
	shift: false,
	alt: false,
	meta: false,
});

const binds = KeyboardGuides();

function matches(special?: [boolean, boolean, boolean, boolean]) {
	special ??= [false, false, false, false];

	if (special[0] && !keyActive.ctrl) return false;
	if (special[1] && !keyActive.alt) return false;
	if (special[2] && !keyActive.shift) return false;
	if (special[3] && !keyActive.meta) return false;
	return true;
}

function onKey(e: KeyboardEvent) {
	debounce(
		() =>
			Object.assign(keyActive, {
				ctrl: e.ctrlKey,
				shift: e.shiftKey,
				alt: e.altKey,
				meta: e.metaKey,
			}),
		{
			wait: 100,
			key: "keyActive",
		},
	);
}

onMounted(() => {
	addEventListener("keydown", onKey);
	addEventListener("keyup", onKey);
});

onUnmounted(() => {
	removeEventListener("keydown", onKey);
	removeEventListener("keyup", onKey);
});
</script>

<template>
  <div class="keybinds">
    <template v-for="(item, _key) in binds">
      <template v-if="'label' in item">
        <entry
          v-if="matches(item.key.special) && evaluate(item.cond, keyActive)"
          :name="evaluate(item.label, keyActive)"
          :keys="item.key"
        />
      </template>
      <template
        v-else
        v-for="(item2, _id) in as<Record<string, BindItems>>(item)"
      >
        <entry
          v-if="
            matches(item2.key.special) &&
            evaluate(item2.cond ?? true, keyActive)
          "
          :name="evaluate(item2.label, keyActive)"
          :keys="item2.key"
        />
      </template>
    </template>
  </div>
</template>

<style lang="scss">
  .keybinds {
    display: flex;
    position: absolute;
    flex-direction: column;
    justify-items: flex-end;
    top: 0;
    right: 0;
    transform: translateY(calc(-100% - 1px));
    font-size: var(--font-sm);
    color: var(--primary-90);
    z-index: 2;

    .item {
      position: relative;
      z-index: -1;
      display: flex;
      margin-left: auto;
      overflow: hidden;
      align-items: center;
      gap: var(--sm);
      padding: calc(var(--sm) / 2) var(--sm);
      background-color: var(--background-body);
      border-radius: calc(var(--sm) / 2);
      + .item {
        margin-top: calc(var(--sm) / -2);
      }

      &::before {
        inset: 0;
        content: '';
        background-color: var(--primary-60-10);
        position: absolute;
        z-index: -1;
      }

      .key {
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'JetBrains Mono', monospace;
        border: 1px solid var(--primary-60-30);
        background-color: var(--primary-60-10);
      }
    }
  }
</style>
