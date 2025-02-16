import { PieceData } from "@/constants/Piece";
import { View } from "react-native";
import { createFilledBlockStyle } from "@/constants/Piece";

export function PieceView({piece, blockSize, style}: {piece: PieceData, blockSize: number, style?: any}) {
    const pieceHeight = piece.matrix.length;
    const pieceWidth = piece.matrix[0].length;
    const pieceBlocks = [];

    for (let y = 0; y < pieceHeight; y++) {
        for (let x = 0; x < pieceWidth; x++) {
            if (piece.matrix[y][x] == 1) {
                const blockStyle = {
                    width: blockSize,
                    height: blockSize,
                    top: y * blockSize,
                    left: x * blockSize,
                    position: "absolute",
                    opacity: 0.8,
                };
                pieceBlocks.push(
                    <View
                        key={`${x},${y}`}
                        style={[createFilledBlockStyle(piece.color, blockSize / 4), blockStyle]}
                    ></View>,
                );
            }
        }
    }

    return <View style={[{
        width: pieceWidth * blockSize,
        height: pieceHeight * blockSize
    }, style]}>
        {pieceBlocks}
    </View>
}
