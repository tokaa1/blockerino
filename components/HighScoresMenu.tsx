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
            setHighScores(value.sort((a, b) => -(a.score - b.score)));
        });
    }, [setHighScores])

    return <SimplePopupView>
        { highScores.length > 0 &&
            <>
                <Text style={styles.header}>
                    {"All classic high scores (top 10)"}
                </Text>
                <Text style={styles.subHeader}>
                    {"Sorted from high to low."}
                </Text>
            </>
        }
        { highScores.length > 0 && highScores.map((score, idx) => {
            return <Score key={idx} score={score}/>
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
    return <>
        <Text style={styles.scoreValueText}>{String(score.score)}</Text>
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