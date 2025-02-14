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

export async function getHighScores(gameMode: GameModeType, filterZeroes: boolean = true, sort: boolean = true, limit: number = 0): Promise<HighScore[]> {
    const keys = await getHighScoreKeys();
    let scores = [];
    for (const key of keys) {
        const entry = await AsyncStorage.getItem(key);
        if (!entry)
            continue;
        const score = JSON.parse(entry) as HighScore;
        if (gameMode == score.type && (!filterZeroes || score.score != 0))
            scores.push(score);
    }
    if (sort)
        scores.sort((a, b) => -(a.score - b.score))
    if (limit > 0 && scores.length > limit)
        scores = scores.splice(0, limit);
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