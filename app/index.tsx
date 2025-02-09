import { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	Touchable,
	Pressable,
} from "react-native";
import { useFonts } from "expo-font";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withRepeat,
	withSequence,
	withDelay,
	withSpring,
	Easing,
	FadeIn,
	FadeOut,
	SlideInDown,
	BounceInDown,
	BounceInUp,
	ReanimatedLogLevel,
	configureReanimatedLogger,
	runOnJS,
} from "react-native-reanimated";
import { createFilledBlockStyle, getRandomPiece } from "@/constants/Piece";
import Game, { GameMode } from "@/components/Game";
import { useAudioPlayer } from 'expo-audio';

configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false,
});

const colors = ["#FF3333", "#FF00FF", "#00FF00", "#00FF00"];

export default function App() {
	const [loaded] = useFonts({
		"Press-Start-2P": require("../assets/fonts/PressStart2P-Regular.ttf"),
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
		Silkscreen: require("../assets/fonts/Silkscreen-Regular.ttf"),
		SilkscreenBold: require("../assets/fonts/Silkscreen-Bold.ttf"),
	});

	const [playing, setPlaying] = useState<GameMode | null>(null);

	if (!loaded) return null;

	if (playing != null) {
		return <Game gameMode={playing}></Game>;
	}

	return (
		<Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
			{[...Array(25)].map((_, i) => (
				<PieceParticle key={`particle${i}`} />
			))}

			<Animated.Text entering={BounceInUp.duration(800)} style={[styles.logo]}>
				blockerino
			</Animated.Text>

			<MainButton
				onClick={() => {
					setPlaying(GameMode.Classic);
				}}
				backgroundColor={colors[0]}
				title={"Classic ∞"}
				flavorText={"classical line breaking"}
				idleBounce={true}
			/>
			<MainButton
				onClick={() => {
					setPlaying(GameMode.Chaos);
				}}
				backgroundColor={"#000000"}
				title={"Chaos !?"}
				flavorText={"10x10, 5 piece hand!?"}
				style={{ borderWidth: 2, borderColor: "rgb(50, 50, 50)" }}
				textStyle={{ color: "white" }}
				idleBounceRotate={true}
			/>
			<MainButton backgroundColor={colors[1]} title={"High Scores"} />
			<MainButton backgroundColor={colors[2]} title={"Options"} />

			<Animated.Text entering={FadeIn} style={styles.footer}>
				beta version
			</Animated.Text>
		</Animated.View>
	);
}

function MainButton({
	style,
	textStyle,
	backgroundColor,
	title,
	flavorText,
	idleBounce,
	idleBounceRotate,
	onClick,
}: {
	style?: any;
	textStyle?: any;
	backgroundColor: string;
	title: string;
	flavorText?: string;
	idleBounce?: boolean;
	idleBounceRotate?: boolean;
	onClick?: () => void;
}) {
	const scale = useSharedValue(1);
	const translateY = useSharedValue(0);
	const rotationDeg = useSharedValue(0);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateY: translateY.value },
				{ rotate: `${rotationDeg.value}deg` },
				{ scale: scale.value }
			],
		};
	});

	useEffect(() => {
		const idleBounceTotalTime = 3700;
		if (idleBounce) {
			translateY.value = withRepeat(
				withSequence(
					withDelay(2500, withTiming(-30, { duration: 200 })),
					withTiming(0, { duration: 1000, easing: Easing.bounce }),
				),
				1000,
			);
		} else if (idleBounceRotate) {
			const amplitude = 10;
			const steps = 5;
			const stepDuration = 160;
			const anims = [];
			for (let i = 0; i < steps; i++) {
				let deg;
				if (i == steps - 1) {
					deg = 0;
				} else {
					deg = i % 2 == 0 ? -amplitude : amplitude;
				}
				anims.push(
					withTiming(deg, { duration: stepDuration, easing: Easing.cubic }),
				);
			}

			rotationDeg.value = withRepeat(
				withDelay(
					idleBounceTotalTime - stepDuration * steps,
					withSequence(...anims),
				),
				1000,
			);
		}
	}, []);

	const onPress = () => {
		scale.value = withSequence(withTiming(1.25, { duration: 200 }), withTiming(1, { duration: 200 }));
		if (onClick)
			onClick();
	}
	
	return (
		<Pressable style={styles.buttonPressable} onPress={onPress}>
			<Animated.View
				key={title}
				style={[
					styles.button,
					{ backgroundColor },
					animatedStyle,
					style ? style : {},
				]}
			>
				<Text style={[styles.buttonText, textStyle ? textStyle : {}]}>
					{title}
				</Text>
				{flavorText && (
					<Text style={[styles.buttonFlavorText, textStyle ? textStyle : {}]}>
						{flavorText}
					</Text>
				)}
			</Animated.View>
		</Pressable>
	);
}

function PieceParticle() {
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
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
		alignItems: "center",
		justifyContent: "center",
	},
	logo: {
		fontFamily: "Silkscreen",
		fontSize: 40,
		color: "#FFF",
		marginBottom: 50,
		textAlign: "center",
	},
	button: {
		width: "100%",
		height: 60,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
		borderRadius: 10,
		maxWidth: 420,
	},
	buttonPressable: {
		width: "80%",
		height: 60,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
		borderRadius: 10,
		maxWidth: 420,
	},
	buttonText: {
		fontFamily: "Silkscreen",
		fontSize: 24,
		color: "black",
	},
	buttonFlavorText: {
		fontFamily: "Silkscreen",
		fontSize: 14,
		color: "rgb(30, 30, 30)",
	},
	footer: {
		fontFamily: "Silkscreen",
		fontSize: 16,
		color: "#555",
		position: "absolute",
		bottom: 20,
	},
});
