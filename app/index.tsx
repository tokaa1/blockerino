import { useEffect, useState } from "react";
import {
	View,
	StyleSheet,
	Dimensions,
} from "react-native";
import { useFonts } from "expo-font";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withRepeat,
	withSequence,
	withDelay,
	FadeIn,
	FadeOut,
	ReanimatedLogLevel,
	configureReanimatedLogger,
} from "react-native-reanimated";
import { createFilledBlockStyle, getRandomPiece } from "@/constants/Piece";
import Game from "@/components/game/Game";
import React from "react";
import OptionsMenu from "@/components/options/OptionsMenu";
import MainMenu from "@/components/menu/MainMenu";
import { MenuStateType, useAppState } from "@/hooks/useAppState";

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

	const gameMode = appState.containsGameMode();
	
	return (
		<Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
			{[...Array(25)].map((_, i) => (
				<PieceParticle key={`particle${i}`} />
			))}

			{ gameMode && <Game gameMode={gameMode}></Game>}

			{ appState.containsState(MenuStateType.OPTIONS) &&
				<OptionsMenu></OptionsMenu>
			}

			{ (appState.containsState(MenuStateType.MENU) && !gameMode) && 
				<MainMenu></MainMenu>
			}
		
		</Animated.View>
	);
}

const PieceParticle = React.memo(() => {
	const [{width, height}, setWindowDimensions] = useState(Dimensions.get('window'));
	useEffect(() => {
		const handleResize = () => {
			setWindowDimensions(Dimensions.get('window'));
		};

		const listener = Dimensions.addEventListener('change', handleResize);

		return () => {
			listener.remove();
		};
	}, []);
	
	const randomX = Math.random() * width;
	const randomY = Math.random() * height;
	const randomDelay = Math.random() * 5000;

	const randomTargetX = 0;
	const randomTargetY = Math.random() * 50 - 150;

	const opacity = useSharedValue(0);
	const translateXOffset = useSharedValue(0);
	const translateYOffset = useSharedValue(0);

	useEffect(() => {
		opacity.value = withRepeat(
			withSequence(
				withDelay(randomDelay, withTiming(1, { duration: 1000 })),
				withTiming(0, { duration: 1000 }),
			),
			-1,
		);

		translateYOffset.value = withRepeat(
			withSequence(
				withDelay(randomDelay, withTiming(randomTargetY, { duration: 2000 })),
				withTiming(0, { duration: 0 }),
			),
			-1,
		);

		translateXOffset.value = withRepeat(
			withSequence(
				withDelay(randomDelay, withTiming(randomTargetX, { duration: 2000 })),
				withTiming(0, { duration: 0 }),
			),
			-1,
		);
	}, [opacity, translateYOffset, randomDelay]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [
			{ translateY: translateYOffset.value },
			{ translateX: translateXOffset.value },
		],
	}));

	const particleBlockSize = 28;
	const piece = getRandomPiece();
	const pieceHeight = piece.matrix.length;
	const pieceWidth = piece.matrix[0].length;
	const pieceBlocks = [];

	for (let y = 0; y < pieceHeight; y++) {
		for (let x = 0; x < pieceWidth; x++) {
			if (piece.matrix[y][x] == 1) {
				const blockStyle = {
					width: particleBlockSize,
					height: particleBlockSize,
					top: y * particleBlockSize,
					left: x * particleBlockSize,
					position: "absolute",
					opacity: 0.8,
				};
				pieceBlocks.push(
					<View
						key={`${x},${y}`}
						style={[createFilledBlockStyle(piece.color), blockStyle]}
					></View>,
				);
			}
		}
	}

	return (
		<Animated.View
			style={[
				{
					position: "absolute",
					width: particleBlockSize * pieceWidth,
					height: particleBlockSize * pieceHeight,
					left: randomX,
					top: randomY,
				},
				animatedStyle,
			]}
		>
			{pieceBlocks}
		</Animated.View>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
		alignItems: "center",
		justifyContent: "center",
	}
});
