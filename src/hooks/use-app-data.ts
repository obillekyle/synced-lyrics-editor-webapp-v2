import type { LRCLine } from "@/api/parser";
import { useIDBStorage } from "@vue-material/core";
import { inject, provide } from "vue";

type AppData = {
	lyrics: LRCLine[];
	audio?: Blob;
};

export function useAppData() {
	const data = inject(
		"app-data",
		useIDBStorage<AppData>("app-data", { lyrics: [] }),
	);

	provide("app-data", data);
	return data;
}
