import { getRandomPiece, createFilledBlockStyle, PieceData } from "@/constants/Piece";
import React from "react";
import { useEffect, useState } from "react";
import { Dimensions, View } from "react-native";
import Animated, { useSharedValue, withRepeat, withSequence, withDelay, withTiming, useAnimatedStyle } from "react-native-reanimated";
import { PieceView } from "./PieceView";

function PieceParticleComponent() {
    const [{width, height}, setWindowDimensions] = useState(Dimensions.get('window'));
    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions(Dimensions.get('window'));
        };

        const listener = Dimensions.addEventListener('change', handleResize);

        return () => {
            listener.remove();
        };
    }, []);
    
    const randomX = Math.random() * width;
    const randomY = Math.random() * height;
    const randomDelay = Math.random() * 5000;

    const randomTargetX = 0;
    const randomTargetY = Math.random() * 50 - 150;

    const opacity = useSharedValue(0);
    const translateXOffset = useSharedValue(0);
    const translateYOffset = useSharedValue(0);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withDelay(randomDelay, withTiming(1, { duration: 1000 })),
                withTiming(0, { duration: 1000 }),
            ),
            -1,
        );

        translateYOffset.value = withRepeat(
            withSequence(
                withDelay(randomDelay, withTiming(randomTargetY, { duration: 2000 })),
                withTiming(0, { duration: 0 }),
            ),
            -1,
        );

        translateXOffset.value = withRepeat(
            withSequence(
                withDelay(randomDelay, withTiming(randomTargetX, { duration: 2000 })),
                withTiming(0, { duration: 0 }),
            ),
            -1,
        );
    }, [opacity, translateYOffset, randomDelay]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateY: translateYOffset.value },
            { translateX: translateXOffset.value },
        ],
    }));


    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    left: randomX,
                    top: randomY,
                },
                animatedStyle,
            ]}
        >
            <PieceView piece={getRandomPiece()} blockSize={28}></PieceView>
        </Animated.View>
    );
}

export const PieceParticle = React.memo(PieceParticleComponent);