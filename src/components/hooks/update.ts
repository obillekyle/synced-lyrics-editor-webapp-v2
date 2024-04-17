import { computed, ref } from "vue";

export function useToggle(initialValue = false) {
  const internalValue = ref(initialValue);

  const toggle = () => {
    internalValue.value = !internalValue.value;
  };

  const value = computed({
    get: () => internalValue.value,
    set: (newValue) => internalValue.value = newValue
  });

  return { value, toggle };
}