import {
	StyleSheet,
} from "react-native";
import { useFonts } from "expo-font";
import Animated, {
	FadeIn,
	FadeOut,
	ReanimatedLogLevel,
	configureReanimatedLogger,
} from "react-native-reanimated";
import Game from "@/components/game/Game";
import { GameModeType } from '@/hooks/useAppState';
import React from "react";
import OptionsMenu from "@/components/OptionsMenu";
import { MenuStateType, useAppState } from "@/hooks/useAppState";
import MainMenu from "@/components/MainMenu";
import HighScores from "@/components/HighScoresMenu";
import { PieceParticle } from "@/components/PieceParticle";

configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false,
});

export default function App() {
	const [loaded] = useFonts({
		"Press-Start-2P": require("../assets/fonts/PressStart2P-Regular.ttf"),
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
		Silkscreen: require("../assets/fonts/Silkscreen-Regular.ttf"),
		SilkscreenBold: require("../assets/fonts/Silkscreen-Bold.ttf"),
	});

	const [ appState ] = useAppState();

	if (!loaded) return null;

	const gameModeSearch = appState.containsGameMode();
	const gameMode = gameModeSearch ? gameModeSearch.current as GameModeType : undefined;
	
	return (
		<Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
			{[...Array(25)].map((_, i) => (
				<PieceParticle key={`particle${i}`} />
			))}

			{ (appState.containsState(MenuStateType.MENU) && !gameMode) && <MainMenu></MainMenu> }
			{ gameMode && <Game gameMode={gameMode}></Game> }
			{ appState.containsState(MenuStateType.OPTIONS) && <OptionsMenu></OptionsMenu> }
			{ appState.containsState(MenuStateType.HIGH_SCORES) && <HighScores></HighScores>}
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
		alignItems: "center",
		justifyContent: "center",
		width: '100%',
		height: '100%'
	}
});
