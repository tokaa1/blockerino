import { Board, BoardBlockType, GRID_BLOCK_SIZE, HAND_BLOCK_SIZE, HITBOX_SIZE, PossibleBoardSpots } from "@/constants/Board";
import { colorToHex } from "@/constants/Color";
import { createEmptyBlockStyle, createFilledBlockStyle } from "@/constants/Piece";
import { useDroppable } from "@mgcrea/react-native-dnd";
import { StyleSheet, View } from "react-native";
import Animated, { SharedValue, runOnJS, useAnimatedStyle } from "react-native-reanimated";

interface BlockGridProps {
	board: SharedValue<Board>,
	possibleBoardDropSpots: SharedValue<PossibleBoardSpots>
}

function encodeDndId(x: number, y: number): string {
	return `${x},${y}`
}

export default function BlockGrid({board, possibleBoardDropSpots}: BlockGridProps) {
	const blocks = [];
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			const animatedStyle = useAnimatedStyle(() => {
				const block = board.value[y][x];
				let style: any;
				if (block.blockType == BoardBlockType.FILLED || block.blockType == BoardBlockType.HOVERED) {
					style = {
						...createFilledBlockStyle(block.color),
						opacity: block.blockType == BoardBlockType.HOVERED ? 0.3 : 1,
					}
				} else if (block.blockType == BoardBlockType.HOVERED_BREAK_EMPTY || block.blockType == BoardBlockType.HOVERED_BREAK_FILLED) {
					const blockColor = block.blockType == BoardBlockType.HOVERED_BREAK_EMPTY ? block.color : block.hoveredBreakColor;
					style = {
						...createFilledBlockStyle(blockColor),
						shadowColor: colorToHex(blockColor),
						shadowOffset: {width: 0, height: 0},
						shadowOpacity: 1,
						shadowRadius: 14,
						opacity: 1,
					}
				} else {
					style = createEmptyBlockStyle();
				}
				
				return style;
			});
			const blockPositionStyle = {
				position: 'absolute',
				top: y * GRID_BLOCK_SIZE,
				left: x * GRID_BLOCK_SIZE,
			}

			const createStyle = () => {
				"worklet";
				const active = possibleBoardDropSpots.value[y][x] == 1;
				if (active) {
					return {
						width: HITBOX_SIZE,
						height: HITBOX_SIZE
					};
				} else {
					return {
						width: 0,
						height: 0
					};
				}
			}
			
			blocks.push((
				<Animated.View key={`${x},${y}`} style={[styles.emptyBlock, blockPositionStyle as any, animatedStyle]}>
					<BlockDroppable id={encodeDndId(x, y)} createStyle={createStyle} style={styles.hitbox} deps={possibleBoardDropSpots}>
					</BlockDroppable>
				</Animated.View>
			))
		}
	}
	return <View style={styles.grid}>{blocks}</View>
}

interface BlockDroppableProps {
	children?: any,
	id: string,
	createStyle: () => object,
	style: any,
	deps: any
}

function BlockDroppable({children, id, createStyle, style, deps, ...otherProps}: BlockDroppableProps) {
	const { props, activeId } = useDroppable({
		id
	});

	// internally of react-native-dnd, the cache of this draggable's layout is only updated in onLayout
	// reanimated styles/animated styles do not call onLayout
	// because of above, react-native-dnd does not see width or height changes and collisions become off
	// below is a very hacky fix

	const updateLayout = () => {
		// this is a weird solution, but pretty much there is a race condition with updating layout immediately
		// after returning a style within useAnimatedStyle on the UI thread
		// 20ms should be good (> 1000ms/60)
		setTimeout(() => {
			(props.onLayout as any)(null);
		}, 1000/60);
	}

	const animatedStyle = useAnimatedStyle(() => {
		deps;
		runOnJS(updateLayout)();
		const style = createStyle();
		return style;
	}, [props, deps]);

	return (
		<Animated.View {...props} style={[style, animatedStyle]} {...otherProps}>
			{children}
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	emptyBlock: {
		width: GRID_BLOCK_SIZE,
		height: GRID_BLOCK_SIZE,
		margin: 0,
		borderWidth: 1,
		borderRadius: 0,
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
	},
	grid: {
		width: GRID_BLOCK_SIZE * 8 + 8,
		height: GRID_BLOCK_SIZE * 8 + 8,
		position: 'relative',
		borderWidth: 4,
		borderColor: 'rgb(40, 40, 40)'
	},
	hitbox: {
		width: HITBOX_SIZE,
		height: HITBOX_SIZE
	}
});