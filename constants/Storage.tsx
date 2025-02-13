import { GameModeType } from '@/hooks/useAppState';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const highScoresKey = "HIGH_SCORES";

export type HighScoreId = string;

function createHighScoreId(): HighScoreId {
    // too big?
    return Crypto.randomUUID();
}

export interface HighScore {
    score: number,
    date: number,
    type: GameModeType
}

async function getHighScoreKeys(): Promise<HighScoreId[]> {
    const value = await AsyncStorage.getItem(highScoresKey);
    if (value == null) {
        return [];
    }
    return JSON.parse(value) as HighScoreId[];
}

export async function getHighScores(filterZeroes: boolean = true): Promise<HighScore[]> {
    const keys = await getHighScoreKeys();
    const scores = [];
    for (const key of keys) {
        const entry = await AsyncStorage.getItem(key);
        if (!entry)
            continue;
        const score = JSON.parse(entry) as HighScore;
        if (!filterZeroes || score.score != 0)
            scores.push(score);
    }
    return scores;
}

export async function updateHighScore(key: HighScoreId, score: HighScore) {
    AsyncStorage.setItem(key, JSON.stringify(score));
}

export async function createHighScore(score: HighScore): Promise<HighScoreId> {
    const highScoreKeys = await getHighScoreKeys();
    const id = createHighScoreId();
    highScoreKeys.push(id);
    AsyncStorage.setItem(highScoresKey, JSON.stringify(highScoreKeys));
    AsyncStorage.setItem(id, JSON.stringify(score));
    return id;
}