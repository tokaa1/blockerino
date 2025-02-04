import { Color } from "./Color"
import { PieceData } from "./Piece"

export const GRID_BLOCK_SIZE = 46;
export const HAND_BLOCK_SIZE = 22;
export const HITBOX_SIZE = 12;
export const DRAG_JUMP_LENGTH = 150;

export interface XYPoint {
	x: number,
	y: number
}

export enum BoardBlockType {
	EMPTY,
	HOVERED,
	HOVERED_BREAK_FILLED,
	HOVERED_BREAK_EMPTY,
	FILLED
}

export interface BoardBlock {
	blockType: BoardBlockType,
	color: Color,
	hoveredBreakColor: Color
}

export type Board = BoardBlock[][]

export function newEmptyBoard(): Board {
	return new Array(8).fill(null).map(() => {
		return new Array(8).fill(null).map(() => {
			return {blockType: BoardBlockType.EMPTY, color: {r: 0, g: 0, b: 0}, hoveredBreakColor: {r: 0, g: 0, b: 0}};
		})
	})
}

export type PossibleBoardSpots = number[][];

export function emptyPossibleBoardSpots(): PossibleBoardSpots {
	"worklet";
	return new Array(8).fill(null).map(() => {
		return new Array(8).fill(null).map(() => {
			return 0;
		})
	});
}


export function JS_emptyPossibleBoardSpots(): PossibleBoardSpots {
	return new Array(8).fill(null).map(() => {
		return new Array(8).fill(null).map(() => {
			return 0;
		})
	});
}

export function createPossibleBoardSpots(board: Board, piece: PieceData | null): PossibleBoardSpots {
	"worklet";
	if (piece == null) {
		return [];
	}
	const pieceHeight = piece.matrix.length;
	const pieceWidth = piece.matrix[0].length;
	const fitPositions: PossibleBoardSpots = emptyPossibleBoardSpots();

	for (let boardY = 0; boardY <= 8 - pieceHeight; boardY++) {
		for (let boardX = 0; boardX <= 8 - pieceWidth; boardX++) {
			let canFit = true;

			for (let pieceY = 0; pieceY < pieceHeight; pieceY++) {
				for (let pieceX = 0; pieceX < pieceWidth; pieceX++) {
					if (piece.matrix[pieceY][pieceX] === 1 && board[boardY + pieceY][boardX + pieceX].blockType == BoardBlockType.FILLED) {
						canFit = false;
						break;
					}
				}
				if (!canFit) break;
			}

			if (canFit) {
				fitPositions[boardY][boardX] = 1;
			}
		}
	}

	return fitPositions;
}

export function clearHoverBlocks(board: Board): Board {
	"worklet";
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			const blockType = board[y][x].blockType;
			if (blockType == BoardBlockType.HOVERED || blockType == BoardBlockType.HOVERED_BREAK_EMPTY) {
				board[y][x].blockType = BoardBlockType.EMPTY;
			} else if (blockType == BoardBlockType.HOVERED_BREAK_FILLED) {
				board[y][x].blockType = BoardBlockType.FILLED;
			}
		}
	}
	return board;
}

export function placePieceOntoBoard(board: Board, piece: PieceData, dropX: number, dropY: number, blockType: BoardBlockType) {
	"worklet";
	for (let y = 0; y < piece.matrix.length; y++) {
		for (let x = 0; x < piece.matrix[0].length; x++) {
			if (piece.matrix[y][x] == 1) {
				board[dropY + y][dropX + x].blockType = blockType;
				board[dropY + y][dropX + x].color = piece.color;
			}
		}
	}
}

export function updateHoveredBreaks(board: Board, piece: PieceData, dropX: number, dropY: number) {
	"worklet";
	const tempBoard = [...board];
	placePieceOntoBoard(tempBoard, piece, dropX, dropY, BoardBlockType.HOVERED);

	const rowsToClear = new Set<number>();
	const colsToClear = new Set<number>();

	for (let row = 0; row < 8; row++) {
		if (tempBoard[row].every(cell => cell.blockType == BoardBlockType.FILLED || cell.blockType == BoardBlockType.HOVERED)) {
			rowsToClear.add(row);
		}
	}

	for (let col = 0; col < 8; col++) {
		if (tempBoard.every(row => row[col].blockType == BoardBlockType.FILLED || row[col].blockType == BoardBlockType.HOVERED)) {
			colsToClear.add(col);
		}
	}

	const count = rowsToClear.size + colsToClear.size;

	if (count > 0) {
		rowsToClear.forEach(row => {
			for (let col = 0; col < 8; col++) {
				if (board[row][col].blockType == BoardBlockType.FILLED) {
					board[row][col].blockType = BoardBlockType.HOVERED_BREAK_FILLED;
					board[row][col].hoveredBreakColor = piece.color;
				} else {
					board[row][col].blockType = BoardBlockType.HOVERED_BREAK_EMPTY;
				}
			}
		});

		colsToClear.forEach(col => {
			for (let row = 0; row < 8; row++) {
				if (board[row][col].blockType == BoardBlockType.FILLED) {
					board[row][col].blockType = BoardBlockType.HOVERED_BREAK_FILLED;
					board[row][col].hoveredBreakColor = piece.color;
				} else {
					board[row][col].blockType = BoardBlockType.HOVERED_BREAK_EMPTY;
				}
			}
		});
	}
}

export function breakLines(board: Board): number {
	"worklet";
	const rowsToClear = new Set<number>();
	const colsToClear = new Set<number>();

	for (let row = 0; row < 8; row++) {
		if (board[row].every(cell => cell.blockType == BoardBlockType.FILLED)) {
			rowsToClear.add(row);
		}
	}

	for (let col = 0; col < 8; col++) {
		if (board.every(row => row[col].blockType == BoardBlockType.FILLED)) {
			colsToClear.add(col);
		}
	}

	const count = rowsToClear.size + colsToClear.size;

	if (count > 0) {
		rowsToClear.forEach(row => {
			for (let col = 0; col < 8; col++) {
				board[row][col].blockType = BoardBlockType.EMPTY;
			}
		});

		colsToClear.forEach(col => {
			for (let row = 0; row < 8; row++) {
				board[row][col].blockType = BoardBlockType.EMPTY;
			}
		});
	}

	return count;
}