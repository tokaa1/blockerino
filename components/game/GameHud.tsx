import { GRID_BLOCK_SIZE } from "@/constants/Board"
import { useRef, useState } from "react"
import { Easing, StyleSheet, Text, View } from "react-native"
import Animated, { SharedValue, runOnJS, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from "react-native-reanimated"
import AnimatedNumbers from 'react-native-animated-numbers';
import { Hand } from "@/constants/Hand";

interface GameHudProps {
	score: SharedValue<number>,
	combo: SharedValue<number>,
	lastBrokenLine: SharedValue<number>,
	hand: SharedValue<Hand>
}

export function StatsGameHud({ score, combo, lastBrokenLine, hand}: GameHudProps) {
	const [scoreText, setScoreText] = useState("0");
	const scoreAnimValue = useSharedValue(0); // stores the score, used to interpolate the number for animation

	useAnimatedReaction(() => {
		return score.value;
	}, (current, prev) => {
		scoreAnimValue.value = withTiming(current, { duration: 200 });
	})
	
	useAnimatedReaction(() => {
		return scoreAnimValue.value
	}, (current, prev) => {
		runOnJS(setScoreText)(String(Math.floor(current)));
	})

	return <>
		<View style={styles.hudContainer}>
			<View style={styles.scoreContainer}>
				<Text style={{
					color: 'white',
					fontFamily: 'Silkscreen',
					fontSize: 50,
					fontWeight: '100',
					textShadowColor: 'rgb(0, 0, 0)',
					textShadowOffset: { width: 3, height: 3 },
					textShadowRadius: 10
				}}>{scoreText}</Text>
			</View>
			<ComboBar lastBrokenLine={lastBrokenLine} handSize={hand.value.length}></ComboBar>
		</View>
	</>
}

interface ComboBarProps {
	lastBrokenLine: SharedValue<number>,
	handSize: number
};

function ComboBar({ lastBrokenLine, handSize }: ComboBarProps) {
	const width = useSharedValue(100);
	
	useAnimatedReaction(() => {
		return lastBrokenLine.value
	}, (current, previous) => {
		width.value = withSpring((1 - lastBrokenLine.value / handSize) * 100, {
			duration: 800
		})
	})
	
	const animatedStyle = useAnimatedStyle(() => {
		return {
			width: `${width.value}%`
		};
	});

	return (
		<View style={styles.comboBarParent}>
			<Animated.View style={[styles.comboBar, animatedStyle]} />
		</View>
	);
};

export function StickyGameHud() {
	return <View style={styles.stickyHud}>
		<Text style={styles.highScoreLabel}>{"👑0"}</Text>
	</View>
}

const styles = StyleSheet.create({
	stickyHud: {
		position: 'absolute',
		top: -6,
		left: -5
	},
	highScoreLabel: {
		color: 'rgb(240, 175, 12)',
		fontFamily: 'Silkscreen',
		fontSize: 35,
		fontWeight: '100'
	},
	hudContainer: {
		width: '100%',//GRID_BLOCK_SIZE * BOARD_LENGTH + 8,
		height: 120,
		justifyContent: 'center',
		alignItems: 'center',
	},
	scoreContainer: {
		width: '100%',
		height: 54,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 14,
		marginBottom: 14,
	},
	comboBarParent: {
		width: '100%',
		height: 16,
		borderWidth: 2,
		borderRadius: 10,
		borderColor: 'gray',
		zIndex: 100,
	},
	comboBar: {
		height: 12,
		borderRadius: 10,
		backgroundColor: 'blue',
		zIndex: 99,
		position: 'absolute'
	},
	hudLabel: {
		color: 'white',
		fontFamily: 'Silkscreen',
		fontWeight: '900',
		fontSize: 30,
		marginLeft: 2,
		alignSelf: 'flex-start',
		position: 'absolute',
	}
})