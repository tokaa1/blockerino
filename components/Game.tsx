import { PieceData, createFilledBlockStyle, getBlockCount, getRandomPiece, getRandomPieceWorklet } from '@/constants/Piece';
import { DndProvider, DndProviderProps, Draggable, Droppable, Rectangle, SharedPoint, useDraggable, useDroppable } from '@mgcrea/react-native-dnd';
import React, { useRef, useEffect, DependencyList } from 'react';
import { LayoutChangeEvent, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView, State } from 'react-native-gesture-handler';
import Animated, { ReduceMotion, SharedValue, dispatchCommand, runOnJS, runOnUI, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useFonts } from 'expo-font';
import { Color, colorToHex } from '@/constants/Color';
import { BOARD_LENGTH, Board, BoardBlockType, DRAG_JUMP_LENGTH, GRID_BLOCK_SIZE, HAND_BLOCK_SIZE, HITBOX_SIZE, JS_emptyPossibleBoardSpots, PossibleBoardSpots, XYPoint, breakLines, clearHoverBlocks, createPossibleBoardSpots, emptyPossibleBoardSpots, newEmptyBoard, placePieceOntoBoard, updateHoveredBreaks } from '@/constants/Board';
import GameHud from '@/components/GameHud';
import BlockGrid from '@/components/BlockGrid';
import { createRandomHand, createRandomHandWorklet } from '@/constants/Hand';
import HandPieces from '@/components/HandPieces';

// layout = active/dragging
const pieceOverlapsRectangle = (layout: Rectangle, other: Rectangle) => {
	"worklet";
	if (other.width == 0 && other.height == 0) {
		return false;
	}

	return (
		layout.x < other.x + other.width &&
		layout.x + GRID_BLOCK_SIZE > other.x &&
		layout.y < other.y + other.height &&
		layout.y + GRID_BLOCK_SIZE > other.y
	);
};

const SPRING_CONFIG_MISSED_DRAG = {
	mass: 1,
	damping: 1,
	stiffness: 500,
	overshootClamping: true,
	restDisplacementThreshold: 0.01,
	restSpeedThreshold: 0.01,
	reduceMotion: ReduceMotion.Never,
}

function decodeDndId(id: string): XYPoint {
	"worklet";
	return {x: Number(id[0]), y: Number(id[2])}
}

function impactAsyncHelper(style: Haptics.ImpactFeedbackStyle) {
	Haptics.impactAsync(style);
}

function runPiecePlacedHaptic() {
	"worklet";
	runOnJS(impactAsyncHelper)(Haptics.ImpactFeedbackStyle.Light);
}

export const Game = React.memo(() => {
	const board = useSharedValue(newEmptyBoard());
	const draggingPiece = useSharedValue<number | null>(null);
	const possibleBoardDropSpots = useSharedValue<PossibleBoardSpots>(JS_emptyPossibleBoardSpots());
	const hand = useSharedValue(createRandomHand());
	const score = useSharedValue(0);
	const combo = useSharedValue(0);
	// How many moves ago was the last broken line?
	const lastBrokenLine = useSharedValue(3);
	
	const addScoreWithTimeout = (timeout: number, scoreDelta: number) => {
		setTimeout(() => {
			score.value += scoreDelta;
		}, timeout);
	}

	const handleDragEnd: DndProviderProps["onDragEnd"] = ({ active, over }) => {
		"worklet";
		if (over) {
			if (draggingPiece.value == null) {
				return;
			}

			const dropIdStr = over.id.toString();
			const {x: dropX, y: dropY} = decodeDndId(dropIdStr);
			const piece: PieceData = hand.value[draggingPiece.value!]!;
			const pieceHeight = piece.matrix.length;
			const pieceWidth = piece.matrix[0].length;
			//if (dropX + pieceWidth - 1 > 7 || dropY + pieceHeight - 1 > 7)
				//return;

			// the block is gonna fit, let's place the block
			// we'll do the haptics now
			if (Platform.OS != 'web')
				runPiecePlacedHaptic();

			const newBoard = clearHoverBlocks([...board.value]);
			placePieceOntoBoard(newBoard, piece, dropX, dropY, BoardBlockType.FILLED)
			const linesBroken = breakLines(newBoard);
			// add score from placing block
			const pieceBlockCount = getBlockCount(piece);
			score.value += pieceBlockCount;
			if (linesBroken > 0) {
				lastBrokenLine.value = 0;
				combo.value += linesBroken;
				
				// line break score with combo
				runOnJS(addScoreWithTimeout)(200, linesBroken * BOARD_LENGTH * combo.value * pieceBlockCount);
			} else {
				lastBrokenLine.value++;
				if (lastBrokenLine.value >= 3) {
					combo.value = 0;
				}
			}
			
			const newHand = [...hand.value];
			newHand[draggingPiece.value!] = null;

			// is hand empty?
			let empty = true
			for (let i = 0; i < 3; i++) {
				if (newHand[i] != null) {
					empty = false;
					break;
				}
			}
			if (empty) {
				hand.value = createRandomHandWorklet();
			} else {
				hand.value = newHand;
			}
			board.value = newBoard;
		} else {
			board.value = clearHoverBlocks([...board.value]);
		}
		draggingPiece.value = null;
		possibleBoardDropSpots.value = emptyPossibleBoardSpots();
	};

	const handleBegin: DndProviderProps["onBegin"] = (event, meta) => {
		"worklet";
		const handIndex = Number(meta.activeId.toString());
		if (hand.value[handIndex] != null) {
			draggingPiece.value = handIndex;
			possibleBoardDropSpots.value = createPossibleBoardSpots(board.value, hand.value[handIndex]);
		}
	};

	const handleFinalize: DndProviderProps["onFinalize"] = ({ state }) => {
		"worklet";
		if (state !== State.FAILED) {
			
		}
	};

	const handleUpdate: DndProviderProps["onUpdate"] = (event, {activeId, activeLayout, droppableActiveId}) => {
		"worklet";
		if (!droppableActiveId) {
			board.value = clearHoverBlocks([...board.value]);
			return;
		}

		if (draggingPiece.value == null) {
			return;
		}

		const dropIdStr = droppableActiveId.toString();
		const {x: dropX, y: dropY} = decodeDndId(dropIdStr);
		const piece: PieceData = hand.value[draggingPiece.value!]!;
		const pieceHeight = piece.matrix.length;
		const pieceWidth = piece.matrix[0].length;
		//if (dropX + pieceWidth - 1 > 7 || dropY + pieceHeight - 1 > 7)
		//	return;

		const newBoard = clearHoverBlocks([...board.value]);
		updateHoveredBreaks(newBoard, piece, dropX, dropY);

		board.value = newBoard
	}
	
	return (        
		<View style={styles.root}>
			<SafeAreaView style={styles.root}>
				<GestureHandlerRootView style={styles.root}>
					<DndProvider shouldDropWorklet={pieceOverlapsRectangle} springConfig={SPRING_CONFIG_MISSED_DRAG} onBegin={handleBegin} onFinalize={handleFinalize} onDragEnd={handleDragEnd} onUpdate={handleUpdate}>
						<GameHud score={score} combo={combo} lastBrokenLine={lastBrokenLine}></GameHud>
						<BlockGrid board={board} possibleBoardDropSpots={possibleBoardDropSpots}></BlockGrid>
						<HandPieces hand={hand}></HandPieces>
					</DndProvider>
				</GestureHandlerRootView>
			</SafeAreaView>
		</View>
	);
})

const styles = StyleSheet.create({
	root: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#130617',
		padding: 0,
		overflow: 'hidden'
	}
})

export default Game;