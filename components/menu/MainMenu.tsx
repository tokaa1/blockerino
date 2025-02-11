import { useAtom, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { BounceInUp, Easing, FadeIn, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { GameModeType } from "../game/Game";
import { MenuStateType, useSetAppState } from "@/hooks/useAppState";
import { cssColors } from "@/constants/Color";

export default function MainMenu() {
	const [ _, appendAppState ] = useSetAppState();
	
	return <>
		<Animated.Text entering={BounceInUp.duration(800)} style={[styles.logo]}>
			blockerino
		</Animated.Text>

		<MainButton
			onClick={() => {
				appendAppState(GameModeType.Classic);
			}}
			backgroundColor={cssColors.brightNiceRed}
			title={"Classic ∞"}
			flavorText={"classical line breaking"}
			idleBounce={true}
		/>
		<MainButton
			onClick={() => {
				appendAppState(GameModeType.Chaos);
			}}
			backgroundColor={cssColors.pitchBlack}
			title={"Chaos !?"}
			flavorText={"10x10, 5 piece hand!?"}
			style={{ borderWidth: 2, borderColor: "rgb(50, 50, 50)" }}
			textStyle={{ color: "white" }}
			idleBounceRotate={true}
		/>
		<MainButton onClick = {() => {
			appendAppState(MenuStateType.HIGH_SCORES)
		}} backgroundColor={cssColors.pink} title={"High Scores"} />
		<MainButton onClick = {() => {
			appendAppState(MenuStateType.OPTIONS)
		}} backgroundColor={cssColors.green} title={"Options"} />

		<Animated.Text entering={FadeIn} style={styles.footer}>
			beta version
		</Animated.Text>
	</>
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
	const idleAnimTranslateY = useSharedValue(0);
	const hoverAnimTranslateY = useSharedValue(0);
	const translateY = useDerivedValue(() => {
		return idleAnimTranslateY.value + hoverAnimTranslateY.value; 
	});
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
			idleAnimTranslateY.value = withRepeat(
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
	
	const onHoverIn = () => {
		hoverAnimTranslateY.value = withSpring(-10, {duration: 400});
	}
	
	const onHoverOut = () => {
		hoverAnimTranslateY.value = withSpring(0, {duration: 400});
	}
	
	return (
		<Pressable style={styles.buttonPressable} onPress={onPress} onHoverIn={onHoverIn} onHoverOut={onHoverOut}>
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
