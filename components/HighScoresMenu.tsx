import { getHighScores, HighScore } from "@/constants/Storage";
import SimplePopupView from "./SimplePopupView";
import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import StylizedButton from "./StylizedButton";
import { cssColors } from "@/constants/Color";
import { GameModeType, useSetAppState } from "@/hooks/useAppState";

export default function HighScores() {
    const [ setAppState, appendAppState, popAppState ] = useSetAppState();
    const [ highScores, setHighScores ] = useState<HighScore[]>([]);
    
    useEffect(() => {
        getHighScores().then((value) => {
            setHighScores(value);
        });
    }, [setHighScores])

    return <SimplePopupView>
        { highScores.length > 0 && highScores.map((score) => {
            return <Score score={score}/>
        })}
        { highScores.length == 0 && 
            <>
                <Text style={styles.noScoresText}>{"You haven't set a score yet? Get playing!"}</Text>
                <StylizedButton text="Play Classic" onClick={() => {
                    setAppState(GameModeType.Classic)
                }} backgroundColor={cssColors.brightNiceRed}></StylizedButton>
                <StylizedButton text="Play Chaos" onClick={() => {
                    setAppState(GameModeType.Chaos)
                }} backgroundColor={cssColors.pitchBlack} borderColor="white"></StylizedButton>
            </>
        }
        <StylizedButton text="Back" onClick={popAppState} backgroundColor={cssColors.spaceGray}></StylizedButton>
    </SimplePopupView>
}

function Score({score}: {score: HighScore}) {
    return <></>
}

const styles = StyleSheet.create({
    noScoresText: {
        color: 'white',
        fontSize: 30,
        fontFamily: 'Silkscreen',
        textAlign: 'center',
        marginBottom: 20
    }
});