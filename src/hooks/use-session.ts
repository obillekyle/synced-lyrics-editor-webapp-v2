import { inject, provide, reactive, type Reactive } from "vue";

type Session = {
	timing: {
		sorting: boolean;
	};
	preview: {
		translate: boolean;
	};
};

const defaultSession: Session = {
	timing: {
		sorting: false,
	},
	preview: {
		translate: false,
	},
};

export function useSession(): Reactive<Session> {
	const session = inject("app-session", reactive(defaultSession));
	provide("app-session", session);
	return session;
}
