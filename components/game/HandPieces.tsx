import { DRAG_JUMP_LENGTH, GRID_BLOCK_SIZE, HAND_BLOCK_SIZE } from "@/constants/Board";
import { Hand } from "@/constants/Hand";
import { createFilledBlockStyle } from "@/constants/Piece";
import { SharedPoint, useDraggable } from "@mgcrea/react-native-dnd";
import { StyleSheet, View } from "react-native";
import Animated, { SharedValue, runOnJS, useAnimatedStyle, withSequence, withTiming } from "react-native-reanimated";

interface HandProps {
	hand: SharedValue<Hand>
}

export default function HandPieces({ hand }: HandProps) {
	const handSize = hand.value.length;
	const handPieces = [];
	for (let i = 0; i < handSize; i++) {
		// we'll make a 5x5 grid to store the piece data to come
		const pieceBlocks = [];
		// create all blocks
		for (let y = 0; y < 5; y++) {
			for (let x = 0; x < 5; x++) {
				const animatedStyle = useAnimatedStyle(() => {
					const piece = hand.value[i];
					if (piece == null) {
						return {
							// default
							opacity: 0
						};
					}
					const pieceHeight = piece.matrix.length;
					const pieceWidth = piece.matrix[0].length;

					let style = {};
					if (x > pieceWidth - 1 || y > pieceHeight - 1 || piece.matrix[y][x] == 0) {
						style = {
							opacity: 0
						}
					} else {
						style = {
							top: y * GRID_BLOCK_SIZE,
							left: x * GRID_BLOCK_SIZE,
							width: GRID_BLOCK_SIZE,
							height: GRID_BLOCK_SIZE,
							...createFilledBlockStyle(piece.color),
							opacity: 1
						}
					}

					return style;
				})
				pieceBlocks.push(<Animated.View key={`p${x},${y}`} style={[styles.emptyBlock, animatedStyle]}></Animated.View>)
			}
		}

		const id = String(i)

		// style of the piece div
		const animatedStyle = (sleeping: boolean, dragging: boolean, acting: boolean, offset: SharedPoint, hand: Hand) => {
			"worklet";
			const piece = hand[i];
			if (piece == null) {
				return {
					bottom: 0,
					transform: [
						{
							translateX: 0
						},
						{
							translateY: 0
						},
						{
							scale: HAND_BLOCK_SIZE / GRID_BLOCK_SIZE
						}
					]
				}
			}
			const zIndex = dragging ? 999 : acting ? 998 : 1;

			const pieceHeight = piece.matrix.length;
			const pieceWidth = piece.matrix[0].length;

			const style = {
				width: pieceWidth * GRID_BLOCK_SIZE,
				height: pieceHeight * GRID_BLOCK_SIZE,
				opacity: 1,
				zIndex,
				bottom: dragging ? DRAG_JUMP_LENGTH : 0,
				transform: [
					{
						translateX:
							dragging || acting
								? offset.x.value
								: 0,
					},
					{
						translateY:
							dragging || acting
								? offset.y.value
								: 0,
					},
					{
						scale: dragging ? 1 : HAND_BLOCK_SIZE / GRID_BLOCK_SIZE
					},
				]
			};

			return style;
		};

		handPieces.push(
			<View key={"v" + i} style={styles.piece}>
				<PieceDraggable id={id} key={`${i}`} createStyle={animatedStyle} hand={hand}>
					{pieceBlocks}
				</PieceDraggable>
			</View>
		)
	}

	return <View style={styles.hand}>{handPieces}</View>
}

interface PieceDraggableProps {
	children: any,
	id: string,
	createStyle: (sleeping: boolean, dragging: boolean, acting: boolean, offset: SharedPoint, hand: Hand) => object,
	hand: any
}

function PieceDraggable({ children, id, createStyle, hand, ...otherProps }: PieceDraggableProps) {
	const { props, offset, state, setNodeLayout } = useDraggable({
		id,
	});

	// internally of react-native-dnd, the cache of this draggable's layout is only updated in onLayout
	// reanimated styles/animated styles do not call onLayout
	// because of above, react-native-dnd does not see width or height changes and collisions become off
	// below is a very hacky fix
	const updateLayout = () => {
		(setNodeLayout as any)(null);
	}

	const animatedStyle = useAnimatedStyle(() => {
		runOnJS(updateLayout)();
		const isSleeping = state.value === "sleeping"; // Should not animate if sleeping
		const isActive = state.value === "dragging";
		const isActing = state.value === "acting";
		return createStyle(isSleeping, isActive, isActing, offset, hand.value);
	}, [state, hand]);

	return <Animated.View {...props} style={animatedStyle} {...otherProps}>
		{children}
	</Animated.View>
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
	hand: {
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
		position: 'relative',
		marginTop: 40,
		maxWidth: HAND_BLOCK_SIZE * 5 * 3,
		maxHeight: HAND_BLOCK_SIZE * 5 * 2,
		height: HAND_BLOCK_SIZE * 6,
		flexWrap: 'wrap',
		alignSelf: 'center',
		flex: 1,
	},
	piece: {
		width: HAND_BLOCK_SIZE * 5,
		height: HAND_BLOCK_SIZE * 5,
		position: 'relative',
		justifyContent: 'center',
		alignItems: 'center'
	}
})