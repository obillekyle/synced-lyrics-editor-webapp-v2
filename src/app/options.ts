import Options from "@/api/options";
import { defaultKeys } from "@/components/keybinds/keys";

type AppOptions = {
  bypassLrcWarn?: boolean,
  /** @deprecated */
  lastVersion?: string,
  version: number,
  showChangeLog: boolean
  screen: "edit" | "timing" | "lyric",
  keybinds: typeof defaultKeys
}

const options = new Options<AppOptions>({
  autoSave: true,
  defaultOptions: {
    version: 0,
    showChangeLog: true,
  }
});


function update() {
  let version = options.get("version", 0);

  if (version < 1) {
    options.set("lastVersion", "v2.0.1a");
    options.set("keybinds", defaultKeys);
    options.set("screen", "timing");
    options.set("bypassLrcWarn", false);
  }

  if (version < 2) {
    options.unset("lastVersion");
    options.set("keybinds", defaultKeys);
  }
}

update();


export default options;