import AsyncStorage from '@react-native-async-storage/async-storage';

const highScoresKey = "HIGH_SCORES";

export interface HighScore {
    score: number,
    date: Date
}

export async function getHighScores(): Promise<HighScore[]> {
    const value = await AsyncStorage.getItem(highScoresKey);
    if (value == null) {
        return [];
    }
    return JSON.parse(value) as HighScore[];
}

export async function addHighScore(score: HighScore): Promise<void> {
    const highScores = await getHighScores();
    highScores.push(score);
    AsyncStorage.setItem(highScoresKey, JSON.stringify(highScores));
}