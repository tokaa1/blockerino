import { useFonts } from "expo-font";
import { Stack } from "expo-router";

export default function RootLayout() {
	return <Stack screenOptions={{headerShown: false, autoHideHomeIndicator: true}} />;
}
