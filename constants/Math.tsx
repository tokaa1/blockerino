export function randomWithRange(min: number, max: number): number {
    return min + (max - min) * Math.random();
}