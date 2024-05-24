import Options from '@/api/options';
import type { Screens } from './main';
import { defaultKeys } from '@/components/keybinds/keys';

type AppOptions = {
  bypassLrcWarn?: boolean;
  /** @deprecated */
  lastVersion?: string;
  version: number;
  showChangeLog: boolean;
  showKeybinds: boolean;
  screen: Screens;
  debug: boolean;
  lang: string;
  theme: 'light' | 'dark';
  keybinds: typeof defaultKeys;
};

const options = new Options<AppOptions>({
  autoSave: true,
  defaultOptions: {
    version: 0,
    showChangeLog: true,
  },
});

function update() {
  let version = options.get('version', 0);

  if (version < 1) {
    options.set('lastVersion', 'v2.0.1a');
    options.set('keybinds', defaultKeys);
    options.set('screen', 'home');
    options.set('bypassLrcWarn', false);
  }

  if (version < 2) {
    options.unset('lastVersion');
    options.set('keybinds', defaultKeys);
    options.set('showKeyBinds', false);
  }

  if (version < 6) {
  }
}

update();

export default options;
