import { GRID_BLOCK_SIZE } from "@/constants/Board"
import { useEffect, useRef, useState } from "react"
import { Easing, Pressable, StyleSheet, Text, View } from "react-native"
import Animated, { SharedValue, runOnJS, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from "react-native-reanimated"
import AnimatedNumbers from 'react-native-animated-numbers';
import { Hand } from "@/constants/Hand";
import { GameModeType, MenuStateType, useAppState } from "@/hooks/useAppState";
import { getHighScores } from "@/constants/Storage";

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

export function StickyGameHud({gameMode, score}: {gameMode: GameModeType, score: SharedValue<number>}) {
	const [ highestScore, setHighestScore ] = useState(0);
	const [ scoreState, setScoreState ] = useState(score.value);

	useEffect(() => {
		getHighScores(gameMode, true, true).then((highScores) => {
			if (highScores.length == 0)
				return;
			setHighestScore(highScores[0].score);
		});
	}, [setHighestScore]);
	
	useAnimatedReaction(() => {
		return score.value;
	}, (cur, prev) => {
		runOnJS(setScoreState)(score.value);
	});

	return <>
		<Text style={styles.highScoreLabel}>{"👑" + Math.max(scoreState, highestScore)}</Text>
		<SettingsButton></SettingsButton>
	</>
}

function SettingsButton() {
	const [_appState, _setAppState, appendAppState ] = useAppState();

	return <Pressable onPress={() => {appendAppState(MenuStateType.OPTIONS)}} style={styles.settingsButton}>
		<Text style={styles.settingsEmoji}>
			{"⚙️"}
		</Text>
	</Pressable>
}

const styles = StyleSheet.create({
	settingsButton: {
		width: 50,
		height: 50,
		borderRadius: 18,
		backgroundColor: 'rgba(20, 20, 20, 0.8)',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		alignSelf: 'flex-end',
		zIndex: 1000,
		top: 50,
		right: 50
	},
	settingsEmoji: {
		color: 'white',
		fontSize: 30
	},
	highScoreLabel: {
		color: 'rgb(240, 175, 12)',
		fontFamily: 'Silkscreen',
		fontSize: 35,
		fontWeight: '100',
		position: 'absolute',
		top: 50,
		left: 50
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