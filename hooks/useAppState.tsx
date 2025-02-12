import { SetStateAction, atom, useAtom, useAtomValue, useSetAtom } from "jotai";

export enum MenuStateType {
	MENU = 'menu',
	OPTIONS = 'options', 
	HIGH_SCORES = 'highscores'
}

export enum GameModeType {
	Classic = 'classic',
	Chaos = 'chaos'
}

type AppStateType = GameModeType | MenuStateType;
type SetAppState = (value: AppStateType | AppState) => void;
type AppendAppState = (value: AppStateType) => void;
type PopAppState = () => void;

export class AppState {
	public current: AppStateType;
	public prev?: AppState;

	constructor(current: AppStateType, prev?: AppState) {
		this.current = current;
		this.prev = prev;
	}

	public containsGameMode(): AppState | undefined {
		return this.containsStateComparator((type) => {
			return Object.values(GameModeType).includes(type as any);
		}) as AppState | undefined;
	}

	public containsState(type: AppStateType): AppState | undefined {
		return this.containsStateComparator((val: AppStateType) => { return val == type; })
	}

	public containsStateComparator(comparator: (type: AppStateType) => boolean): AppState | undefined {
		if (comparator(this.current))
			return this;
		if (!this.prev)
			return undefined;
		let s: AppState | undefined = this.prev;
		while (s) {
			if (comparator(s.current)) {
				return s;
			}
			s = s.prev;
		}
		return undefined;
	}
}

const appStateAtom = atom<AppState>(new AppState(MenuStateType.MENU));

function createAppStateFunctions(setAppStateAtom: (...args: any) => void): [SetAppState, AppendAppState, PopAppState] {
	const setAppState = (value: AppStateType | AppState) => {
		setAppStateAtom(typeof value == typeof AppState ? value as AppState : new AppState(value as AppStateType));
	}
	const appendAppState = (value: AppStateType) => {
		setAppStateAtom((current: AppState) => {
			if (value == current.current) {
				console.warn("Bug? - appending the same state type onto itself.");
			}
			return new AppState(value, current);
		});
	}
	const popAppState = () => {
		setAppStateAtom((current: AppState) => {
			if (current.prev) {
				return current.prev;
			} else {
				console.warn("Tried to pop app state with no previous state!");
			}
		});
	}
	return [ setAppState, appendAppState, popAppState ];
}

export function useAppState(): [AppState, SetAppState, AppendAppState, PopAppState] {
	const [ appState, setAppStateAtom ] = useAtom(appStateAtom);

	return [ appState, ...createAppStateFunctions(setAppStateAtom) ];
}

export function useAppStateValue(): AppState {
	return useAtomValue(appStateAtom);
}

export function useSetAppState(): [SetAppState, AppendAppState, PopAppState] {
	const setState = useSetAtom(appStateAtom);
	return createAppStateFunctions(setState);
}