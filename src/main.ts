import "./global";
import "./assets/main.scss";
import "./assets/markdown.scss";
import "./assets/formatter.scss";

import App from "./App.vue";
import { createApp } from "vue";
import modalPresets from "./components/modals/presets";
import { AppScreens } from "./app/main";

createApp(App).mount("#app");
