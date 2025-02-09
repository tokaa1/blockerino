import {
	Board,
	BoardBlockType,
	GRID_BLOCK_SIZE,
	HAND_BLOCK_SIZE,
	HITBOX_SIZE,
	PossibleBoardSpots,
} from "@/constants/Board";
import { colorToHex } from "@/constants/Color";
import { Hand } from "@/constants/Hand";
import {
	PieceData,
	createEmptyBlockStyle,
	createFilledBlockStyle,
} from "@/constants/Piece";
import { useDroppable } from "@mgcrea/react-native-dnd";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	SharedValue,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSequence,
	withTiming,
} from "react-native-reanimated";

interface BlockGridProps {
	board: SharedValue<Board>;
	possibleBoardDropSpots: SharedValue<PossibleBoardSpots>;
	hand: SharedValue<Hand>
	draggingPiece: SharedValue<number | null>
}

function encodeDndId(x: number, y: number): string {
	return `${x},${y}`;
}

function createBlockStyle(
	x: number,
	y: number,
	board: SharedValue<Board>,
): any {
	const boardSize = board.value.length;
	const loadBlockFlash = useSharedValue(0);

	useEffect(() => {
		if (board.value[y][x].blockType != BoardBlockType.EMPTY) 
			return;
		const step = 70;
		const upwardDelay = (boardSize - 1 - y) * step;
		const downwardDelay = 2 * y * step;
		
		loadBlockFlash.value = withDelay(
			upwardDelay,
			withSequence(
				withTiming(1, { duration: step }),
				withDelay(downwardDelay, withTiming(0, { duration: step }))
			)
		);
	});

	const animatedStyle = useAnimatedStyle(() => {
		const block = board.value[y][x];
		if (block.blockType == BoardBlockType.EMPTY && loadBlockFlash.value != 0) {
			return {
				...createFilledBlockStyle(block.color),
				opacity: Math.min(1, loadBlockFlash.value * 10),
			};
		}

		let style: any;
		if (
			block.blockType == BoardBlockType.FILLED ||
			block.blockType == BoardBlockType.HOVERED
		) {
			style = {
				...createFilledBlockStyle(block.color),
				opacity: block.blockType == BoardBlockType.HOVERED ? 0.3 : 1,
			};
		} else if (
			block.blockType == BoardBlockType.HOVERED_BREAK_EMPTY ||
			block.blockType == BoardBlockType.HOVERED_BREAK_FILLED
		) {
			const blockColor =
				block.blockType == BoardBlockType.HOVERED_BREAK_EMPTY
					? block.color
					: block.hoveredBreakColor;
			style = {
				...createFilledBlockStyle(blockColor),
				shadowColor: colorToHex(blockColor),
				shadowOffset: { width: 0, height: 0 },
				shadowOpacity: 1,
				shadowRadius: 14,
				opacity: 1,
			};
		} else {
			style = createEmptyBlockStyle();
		}

		return style;
	});
	return animatedStyle;
}

export default function BlockGrid({
	board,
	possibleBoardDropSpots,
	draggingPiece,
	hand
}: BlockGridProps) {
	const blocks = [];
	const boardLength = board.value.length;
	for (let y = 0; y < boardLength; y++) {
		for (let x = 0; x < boardLength; x++) {
			const animatedStyle = createBlockStyle(x, y, board);
			const blockPositionStyle = {
				position: "absolute",
				top: y * GRID_BLOCK_SIZE,
				left: x * GRID_BLOCK_SIZE,
			};

			// used to set the size of the droppable to 0 (pieces cannot be dropped on this block)
			const createStyle = (possibleBoardDropSpots: PossibleBoardSpots) => {
				"worklet";
				const active = possibleBoardDropSpots[y][x] == 1;
				if (active) {
					return {
						width: HITBOX_SIZE,
						height: HITBOX_SIZE,
					};
				} else {
					return {
						width: 0,
						height: 0,
					};
				}
			};

			blocks.push(
				<Animated.View
					key={`${x},${y}`}
					style={[styles.emptyBlock, blockPositionStyle as any, animatedStyle]}
				>
					<BlockDroppable
						id={encodeDndId(x, y)}
						createStyle={createStyle}
						style={styles.hitbox}
						possibleBoardDropSpots={possibleBoardDropSpots}
					></BlockDroppable>
				</Animated.View>,
			);
		}
	}
	
	const gridStyle = useAnimatedStyle(() => {
		let style: any;
		if (draggingPiece.value == null) {
			style = {
				borderColor: 'white'
			}
		} else {
			style = {
				borderColor: colorToHex(hand.value[draggingPiece.value!]!.color)
			}
		}
		return style;
	});
	
	return (
		<Animated.View
			style={[
				styles.grid,
				{
					width: GRID_BLOCK_SIZE * boardLength + 6,
					height: GRID_BLOCK_SIZE * boardLength + 6,
				},
				gridStyle
			]}
		>
			{blocks}
		</Animated.View>
	);
}

interface BlockDroppableProps {
	children?: any;
	id: string;
	createStyle: (deps: PossibleBoardSpots) => object;
	style: any;
	possibleBoardDropSpots: SharedValue<PossibleBoardSpots>;
}

function BlockDroppable({
	children,
	id,
	createStyle,
	style,
	possibleBoardDropSpots,
	...otherProps
}: BlockDroppableProps) {
	const { props, activeId } = useDroppable({
		id,
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
		}, 1000 / 60);
	};

	const animatedStyle = useAnimatedStyle(() => {
		runOnJS(updateLayout)();
		const style = createStyle(possibleBoardDropSpots.value);
		return style;
	}, [props]);

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
		position: "absolute",
		justifyContent: "center",
		alignItems: "center",
	},
	grid: {
		//width: GRID_BLOCK_SIZE * BOARD_LENGTH + 8,
		//height: GRID_BLOCK_SIZE * BOARD_LENGTH + 8,
		position: "relative",
		backgroundColor: "rgb(0, 0, 0, 1)",
		borderWidth: 3,
		borderRadius: 5,
		borderColor: "rgb(255, 255, 255)",
		opacity: 1,
	},
	hitbox: {
		width: HITBOX_SIZE,
		height: HITBOX_SIZE,
	},
});
