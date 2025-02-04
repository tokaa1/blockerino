import { GRID_BLOCK_SIZE } from "@/constants/Board"
import { useRef, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import Animated, { SharedValue, runOnJS, useAnimatedReaction, useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated"
import AnimatedNumbers from 'react-native-animated-numbers';

interface GameHudProps {
	score: SharedValue<number>,
	combo: SharedValue<number>,
	lastBrokenLine: SharedValue<number>
}

export default function GameHud({ score, combo, lastBrokenLine }: GameHudProps) {
	const [ scoreState, setScoreState ] = useState(0);
	
	useAnimatedReaction(() => {
		return score.value;
	}, (currentValue, previousValue) => {
		runOnJS(setScoreState)(currentValue);
	})
	
	return (
		<View style={styles.hudContainer}>
			<View style={styles.scoreContainer}>
				<AnimatedNumbers includeComma={false} animateToNumber={scoreState} animationDuration={700} fontStyle={{
					color: 'white',
					fontFamily: 'SpaceMono',
					fontSize: 50,
					fontWeight: '900',
					textShadowColor: 'rgb(0, 0, 0)',
					textShadowOffset: {width: 3, height: 3},
					textShadowRadius: 10
				}}/>
			</View>
			<ComboBar lastBrokenLine={lastBrokenLine}></ComboBar>
		</View>
	)
}

interface ComboBarProps {
	lastBrokenLine: SharedValue<number>
};

function ComboBar({ lastBrokenLine }: ComboBarProps) {
	const animatedStyle = useAnimatedStyle(() => {
		console.log(lastBrokenLine.value);
		return {
			width: `${(1 - (lastBrokenLine.value / 3)) * 100}%`,
		};
	});

	return (
		<View style={styles.comboBarParent}>
			<Animated.View style={[styles.comboBar, animatedStyle]} />
		</View>
	);
};

const styles = StyleSheet.create({
	hudContainer: {
		width: GRID_BLOCK_SIZE * 8 + 8,
		height: 120,
		justifyContent: 'center',
		alignItems: 'center'
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
		fontFamily: 'SpaceMono',
		fontWeight: '900',
		fontSize: 30,
		marginLeft: 2,
		alignSelf: 'flex-start',
		position: 'absolute',
	}
})