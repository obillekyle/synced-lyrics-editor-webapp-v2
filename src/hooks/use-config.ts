import { toProxy } from "@vue-material/core";
import { useShared } from "./use-shared";

type Config = {
	version: number;
	preferences: {
		showKeyBinds: boolean;
		theme: "light" | "dark";
		colorScheme: {
			primary?: string;
			secondary?: string;
			tertiary?: string;
		};
		lang: string;
	};
	navigation: {
		showHome: boolean;
		centered: boolean;
		showLabels: boolean;
	};
	debug: boolean;
	lastVersion?: string;
	showChangeLog: boolean;
	showBuildType: boolean;
};

const defaultConfig: Config = {
	version: 1,
	preferences: {
		showKeyBinds: true,
		theme: "light",
		colorScheme: {},
		lang: "en",
	},
	navigation: {
		showHome: true,
		centered: true,
		showLabels: true,
	},
	debug: false,
	lastVersion: undefined,
	showChangeLog: false,
	showBuildType: false,
};

export const useConfig = () => toProxy(useShared("app-config", defaultConfig));
