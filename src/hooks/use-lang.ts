import { I18N } from "@/api/i18n";
import { toProxy } from "@vue-material/core";
import {
	computed,
	inject,
	onMounted,
	provide,
	reactive,
	ref,
	shallowRef,
	watch,
	type ComputedRef,
	type ShallowReactive,
} from "vue";

async function fetchLanguage(lang: string): Promise<Map<string, string>> {
	const req = await fetch(`/i18n/${lang}.json`);

	if (!req.ok) {
		return lang !== "en" ? await fetchLanguage("en") : new Map();
	}

	const json = await req.json();
	return new Map(Object.entries(json.strings));
}

type UseLang = {
	ready: boolean;
	lang: string;
	store: Map<string, string>;
	set(newLang: string): void;
	get(key: string, ...args: unknown[]): string | undefined;
	has(key: string): boolean;
};

export function useLang(defaultLang: string): ShallowReactive<UseLang> {
	const Lang = inject<ShallowReactive<UseLang>>("app-lang");

	if (Lang) return Lang;

	const ready = ref(false);
	const store = shallowRef<Map<string, string>>(new Map());
	const lang = ref(defaultLang);

	watch(lang, async () => {
		store.value = await fetchLanguage(lang.value);
		ready.value = true;
	});

	const provided = toProxy(
		computed(() => ({
			ready: ready.value,
			lang: lang.value,
			store: store.value,
			set(newLang: string) {
				lang.value = newLang;
			},
			has(key: string) {
				return store.value.has(key);
			},
			get(key: string, ...args: unknown[]) {
				if (store.value.has(key)) {
					const translation = store.value.get(key) || "";
					return translation.replace(/{(\d+)}/g, (match, number) => {
						const data = args[Number(number)];
						return data === undefined ? match : String(args[number]);
					});
				}
			},
		})),
	);

	provide("app-lang", provided);

	return provided;
}
