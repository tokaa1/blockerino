import { PieceData, getRandomPiece, getRandomPieceWorklet } from "./Piece";

export type Hand = (PieceData | null)[]

export function createRandomHand(): Hand {
	const hand = new Array<PieceData | null>(3);
	for (let i = 0; i < 3; i++) {
		hand[i] = getRandomPiece();
	}
	return hand;
}

export function createRandomHandWorklet(): Hand {
	"worklet";
	const hand = new Array<PieceData | null>(3);
	for (let i = 0; i < 3; i++) {
		hand[i] = getRandomPieceWorklet();
	}
	return hand;
}