import { PieceData, getBlockCount } from '@/constants/Piece';
import { DndProvider, DndProviderProps, Rectangle } from '@mgcrea/react-native-dnd';
import React, { DependencyList, useEffect, useRef } from 'react';
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView, State } from 'react-native-gesture-handler';
import { ReduceMotion, runOnJS, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BoardBlockType, GRID_BLOCK_SIZE, JS_emptyPossibleBoardSpots, PossibleBoardSpots, XYPoint, breakLines, clearHoverBlocks, createPossibleBoardSpots, emptyPossibleBoardSpots, newEmptyBoard, placePieceOntoBoard, updateHoveredBreaks } from '@/constants/Board';
import { StatsGameHud, StickyGameHud } from '@/components/game/GameHud';
import BlockGrid from '@/components/game/BlockGrid';
import { createRandomHand, createRandomHandWorklet } from '@/constants/Hand';
import HandPieces from '@/components/game/HandPieces';
import { GameModeType } from '@/hooks/useAppState';
import { createHighScore, HighScoreId, updateHighScore } from '@/constants/Storage';

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

export const Game = (({gameMode}: {gameMode: GameModeType}) => {
	const boardLength = gameMode == GameModeType.Chaos ? 10 : 8;
	const handSize = gameMode == GameModeType.Chaos ? 5 : 3;
	const board = useSharedValue(newEmptyBoard(boardLength));
	const draggingPiece = useSharedValue<number | null>(null);
	const possibleBoardDropSpots = useSharedValue<PossibleBoardSpots>(JS_emptyPossibleBoardSpots(boardLength));
	const hand = useSharedValue(createRandomHand(handSize));
	const score = useSharedValue(0);
	const combo = useSharedValue(0);
	// How many moves ago was the last broken line?
	const lastBrokenLine = useSharedValue(0);

	const scoreStorageId = useSharedValue<HighScoreId | undefined>(undefined);

	useEffect(() => {
		if (scoreStorageId.value != undefined)
			return;
		createHighScore({score: score.value, date: new Date().getTime(), type: gameMode}).then((id) => {
			scoreStorageId.value = id;
		});
	}, [scoreStorageId]);

	const handleDragEnd: DndProviderProps["onDragEnd"] = ({ active, over }) => {
		"worklet";
		if (over) {
			if (draggingPiece.value == null) {
				return;
			}

			const dropIdStr = over.id.toString();
			const {x: dropX, y: dropY} = decodeDndId(dropIdStr);
			const piece: PieceData = hand.value[draggingPiece.value!]!;

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
				// line break score + combo multiplier stuff
				score.value += linesBroken * boardLength * (combo.value / 2) * pieceBlockCount;
			} else {
				lastBrokenLine.value++;
				if (lastBrokenLine.value >= handSize) {
					combo.value = 0;
				}
			}
			if (scoreStorageId)
				runOnJS(updateHighScore)(scoreStorageId.value!, {score: score.value, date: new Date().getTime(), type: gameMode});
			
			const newHand = [...hand.value];
			newHand[draggingPiece.value!] = null;

			// is hand empty?
			let empty = true
			for (let i = 0; i < handSize; i++) {
				if (newHand[i] != null) {
					empty = false;
					break;
				}
			}
			if (empty) {
				hand.value = createRandomHandWorklet(handSize);
			} else {
				hand.value = newHand;
			}
			board.value = newBoard;
		} else {
			board.value = clearHoverBlocks([...board.value]);
		}
		draggingPiece.value = null;
		possibleBoardDropSpots.value = emptyPossibleBoardSpots(boardLength);
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
		if (state !== State.END) {
			draggingPiece.value = null;
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

		const newBoard = clearHoverBlocks([...board.value]);
		updateHoveredBreaks(newBoard, piece, dropX, dropY);

		board.value = newBoard
	}
	
	return (        
		<SafeAreaView style={styles.root}>
			<GestureHandlerRootView style={styles.root}>
				<View style={styles.root}>
					<StickyGameHud gameMode={gameMode} score={score}></StickyGameHud>
					<DndProvider shouldDropWorklet={pieceOverlapsRectangle} springConfig={SPRING_CONFIG_MISSED_DRAG} onBegin={handleBegin} onFinalize={handleFinalize} onDragEnd={handleDragEnd} onUpdate={handleUpdate}>
						<StatsGameHud score={score} combo={combo} lastBrokenLine={lastBrokenLine} hand={hand}></StatsGameHud>
						<BlockGrid board={board} possibleBoardDropSpots={possibleBoardDropSpots} hand={hand} draggingPiece={draggingPiece}></BlockGrid>
						<HandPieces hand={hand}></HandPieces>
					</DndProvider>
				</View>
			</GestureHandlerRootView>
		</SafeAreaView>
	);
})

const styles = StyleSheet.create({
	root: {
		width: '100%',
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 0,
		overflow: 'hidden',
		backgroundColor: 'rgba(0, 0, 0, 0.4)' 
	}
})

export default Game;