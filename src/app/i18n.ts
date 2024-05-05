import {
  type Component,
  ref,
} from 'vue';

export function i18n(key: string, ...args: any[]): string {
  const i18n = window.app.i18n;
  return i18n ? i18n.get(key, ...args) : key
}

export function i18nComp(key: string, ...args: any[]): Component {
  const i18n = window.app.i18n;

  return {
    setup() {
      const text = ref('');
      return { text }
    },


    updateText() {
      this.text = i18n ? i18n.get(this.entry, ...args) : key
    },

    mounted() {
      this.updateText()
      i18n.addEventListener('update', this.updateText)
    },

    unmounted() {
      i18n.removeEventListener('update', this.updateText)
    },

    template() {
      return `
        <span>${this.text}</span>
      `
    }
  }
}