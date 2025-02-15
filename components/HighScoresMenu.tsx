import { getHighScores, HighScore } from "@/constants/Storage";
import SimplePopupView from "./SimplePopupView";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import StylizedButton from "./StylizedButton";
import { cssColors } from "@/constants/Color";
import { GameModeType, useSetAppState } from "@/hooks/useAppState";

export default function HighScores() {
    const [ setAppState, _appendAppState, popAppState ] = useSetAppState();
    const [ highScores, setHighScores ] = useState<HighScore[]>([]);
    const [ gameMode, setGameMode ] = useState(GameModeType.Classic);
    
    useEffect(() => {
        getHighScores(gameMode, true, true, 10).then((value) => {
            setHighScores(value);
        });
    }, [gameMode, setHighScores]);

    return <SimplePopupView style={[{justifyContent: 'flex-start'}]}>
        <StylizedButton text="Back" onClick={popAppState} backgroundColor={cssColors.spaceGray}></StylizedButton>
        { highScores.length > 0 &&
            <>
                <Text style={styles.subHeader}>
                    {"Select a game mode..."}
                </Text>
                <View style={{flexDirection: 'row'}}>
                    <StylizedButton text="Classic" onClick={() => { setGameMode(GameModeType.Classic) }} backgroundColor={cssColors.brightNiceRed}></StylizedButton>
                    <StylizedButton text="Chaos" onClick={() => { setGameMode(GameModeType.Chaos) }} backgroundColor={cssColors.pitchBlack}></StylizedButton>
                </View>
                <Text style={styles.header}>
                    {"All classic high scores (top 10)"}
                </Text>
                <Text style={styles.subHeader}>
                    {"Sorted from high to low."}
                </Text>
                {
                    highScores.map((score, idx) => {
                        return <Score key={idx} rank={idx + 1} score={score}/>
                    })
                }
            </>
        }
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
    </SimplePopupView>
}

function Score({score, rank}: {score: HighScore, rank: number}) {
    return <>
        <Text style={styles.scoreValueText}>{"#" + String(rank) + " - " + String(score.score)}</Text>
        <Text style={styles.scoreTimeText}>{createTimeAgoString(score.date)}</Text>
    </>
}

function createTimeAgoString(date: number): string {
    const now = new Date();
    const seconds = Math.round((now.getTime() - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30);
    const years = Math.round(days / 365);
  
    if (seconds < 60) {
      return seconds <= 0 ? 'now' : `${seconds} seconds ago`;
    } else if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else if (days < 30) {
      return `${days} days ago`;
    } else if (months < 12) {
      return `${months} months ago`;
    } else {
      return `${years} years ago`;
    }
  }

const styles = StyleSheet.create({
    noScoresText: {
        color: 'white',
        fontSize: 30,
        fontFamily: 'Silkscreen',
        textAlign: 'center',
        marginBottom: 20
    },
    scoreValueText: {
        color: 'white',
        fontSize: 30,
        fontFamily: 'Silkscreen'
    },
    scoreTimeText: {
        color: 'rgb(150, 150, 150)',
        fontSize: 15,
        fontFamily: 'Silkscreen'
    },
    header: {
        color: 'white',
        fontSize: 30,
        fontFamily: 'Silkscreen'
    },
    subHeader: {
        color: 'rgb(100, 100, 100)',
        fontSize: 24,
        fontFamily: 'Silkscreen'
    }
});