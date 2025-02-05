import { Color, colorToHex } from "./Color";

export interface PieceData {
	matrix: number[][];
	difficultyRatio: number;
	color: Color;
}

// same as piecedata but with no color
// this is because color is random each time
// so we will use this one to store piece shape and info
interface PieceDataSaved {
	matrix: number[][];
	difficultyRatio: number
}

export const piecesData: PieceDataSaved[] = [
	// L-shape
	{
		matrix: [
			[1, 0, 0],
			[1, 1, 1],
		],
		difficultyRatio: 0.5,

	},
	{
		matrix: [
			[1, 1],
			[1, 0],
			[1, 0],
		],
		difficultyRatio: 0.5,

	},
	{
		matrix: [
			[1, 1, 1],
			[0, 0, 1],
		],
		difficultyRatio: 0.5,

	},
	{
		matrix: [
			[0, 1],
			[0, 1],
			[1, 1],
		],
		difficultyRatio: 0.5,

	},
	{
		matrix: [
			[0, 0, 1],
			[1, 1, 1],
		],
		difficultyRatio: 0.5,

	},
	{
		matrix: [
			[1, 0],
			[1, 0],
			[1, 1],
		],
		difficultyRatio: 0.5,

	},
	{
		matrix: [
			[1, 1, 1],
			[1, 0, 0],
		],
		difficultyRatio: 0.5,

	},
	{
		matrix: [
			[1, 1],
			[0, 1],
			[0, 1],
		],
		difficultyRatio: 0.5,

	},
	// Triangle shape
	{
		matrix: [
			[1, 1, 1],
			[0, 1, 0],
		],
		difficultyRatio: 0.5,

	},
	{
		matrix: [
			[1, 0],
			[1, 1],
			[1, 0],
		],
		difficultyRatio: 0.5,

	},
	{
		matrix: [
			[0, 1, 0],
			[1, 1, 1],
		],
		difficultyRatio: 0.5,

	},
	{
		matrix: [
			[0, 1],
			[1, 1],
			[0, 1],
		],
		difficultyRatio: 0.5,

	},
	// Z/S shape
	{
		matrix: [
			[0, 1, 1],
			[1, 1, 0],
		],
		difficultyRatio: 0.5,

	},
	{
		matrix: [
			[1, 0],
			[1, 1],
			[0, 1],
		],
		difficultyRatio: 0.5,

	},
	{
		matrix: [
			[1, 1, 0],
			[0, 1, 1],
		],
		difficultyRatio: 0.5,

	},
	{
		matrix: [
			[0, 1],
			[1, 1],
			[1, 0],
		],
		difficultyRatio: 0.5,

	},
	// 3x3
	{
		matrix: [
			[1, 1, 1],
			[1, 1, 1],
			[1, 1, 1],
		],
		difficultyRatio: 0.5,

	},
	// 2x2
	{
		matrix: [
			[1, 1],
			[1, 1],
		],
		difficultyRatio: 0.5,

	},
	// 4x1
	{
		matrix: [
			[1],
			[1],
			[1],
			[1],
		],
		difficultyRatio: 0.5,

	},
	// 1x4
	{
		matrix: [
			[1, 1, 1, 1],
		],
		difficultyRatio: 0.5,

	},
];

const pieceColors = [
	{ r: 161, g: 3, b: 252 },
	{ r: 242, g: 197, b: 48 },
	{ r: 42, g: 23, b: 209 },
	{ r: 176, g: 14, b: 55 }
]

export function getBlockCount(piece: PieceData): number {
	"worklet";
	let count = 0;
	for (let y = 0; y < piece.matrix.length; y++) {
		for (let x = 0; x < piece.matrix[0].length; x++) {
			if (piece.matrix[y][x] == 1)
				count++;
		}
	}
	return count;
}

export function getRandomPiece(): PieceData {
	let piece = piecesData[Math.floor(Math.random() * piecesData.length)];

	return {
		...piece,
		color: pieceColors[Math.floor(Math.random() * pieceColors.length)]
	};
}

export function getRandomPieceWorklet(): PieceData {
	"worklet";
	let piece = piecesData[Math.floor(Math.random() * piecesData.length)];

	return {
		...piece,
		color: pieceColors[Math.floor(Math.random() * pieceColors.length)]
	};
}

function getBorderColors(backgroundColor: Color) {
	"worklet";
	const { r, g, b } = backgroundColor;

	// multipliers calculated from a screenshot
	const multipliers = {
		borderTopColor: { r: 214 / 131, g: 167 / 83, b: 247 / 203 },
		borderLeftColor: { r: 164 / 131, g: 119 / 83, b: 224 / 203 },
		borderRightColor: { r: 123 / 131, g: 69 / 83, b: 153 / 203 },
		borderBottomColor: { r: 92 / 131, g: 43 / 83, b: 132 / 203 }
	};

	const clamp = (value: number) => Math.min(Math.max(Math.round(value), 0), 255);

	const computeColor = (mult: any) =>
		`rgb(${clamp(r * mult.r)}, ${clamp(g * mult.g)}, ${clamp(b * mult.b)})`;

	return {
		borderTopColor: computeColor(multipliers.borderTopColor),
		borderLeftColor: computeColor(multipliers.borderLeftColor),
		borderRightColor: computeColor(multipliers.borderRightColor),
		borderBottomColor: computeColor(multipliers.borderBottomColor)
	};
}

export function createFilledBlockStyle(color: Color): object {
	"worklet";
	return {
		backgroundColor: colorToHex(color), //'rgb(131, 83, 203)'
		...getBorderColors(color),
		borderWidth: 7,
		boxSizing: 'border-box',
		boxShadow: 'none',
		shadowOpacity: 0,
	}
}

export function createEmptyBlockStyle(): object {
	"worklet";
	const borderColor = 'rgb(40, 40, 40)';
	return {
		backgroundColor: 'rgb(0, 0, 0)',
		borderColor: borderColor,
		borderLeftColor: borderColor,
		borderTopColor: borderColor,
		borderRightColor: borderColor,
		borderBottomColor: borderColor,
		opacity: 1,
		borderWidth: 0.5,
		borderRadius: 0,
		boxSizing: 'border-box',
		boxShadow: 'none',
		shadowOpacity: 0,
	}
}