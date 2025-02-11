import { GameMode } from "@/components/game/Game";
import { SetStateAction, atom, useAtom, useSetAtom } from "jotai";

export enum AppState {
	MENU = 'menu',
	OPTIONS = 'options', 
	HIGH_SCORES = 'highscores'
}

const appStateAtom = atom<GameMode | AppState>(AppState.MENU);

export function useAppState(): [GameMode | AppState, (value: GameMode | AppState) => void] {
	const state = useAtom(appStateAtom);
	return state;
}

export function useSetAppState(): (value: GameMode | AppState) => void {
	const setState = useSetAtom(appStateAtom);
	return setState;
}