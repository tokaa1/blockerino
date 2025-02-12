import { cssColors } from "@/constants/Color";
import { MenuStateType, useAppState, useAppStateValue } from "@/hooks/useAppState";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

export default function OptionsMenu() {
	const [ appState, setAppState, _appendAppState, popAppState ] = useAppState();

	return <View style={styles.optionsView}>
		<StylizedButton onClick={popAppState} text="Back" backgroundColor={cssColors.spaceGray}></StylizedButton>
		{ appState.containsGameMode() && 
			<StylizedButton onClick={() => { setAppState(MenuStateType.MENU) }} text="Quit Run" backgroundColor={cssColors.brightNiceRed}></StylizedButton>
		}
	</View>
}

function StylizedButton({text, onClick, backgroundColor, centered}: {text: string, onClick?: () => void, backgroundColor: string, centered?: boolean}) {
	if (centered == undefined) {
		centered = true;
	}
	return <Pressable onPress={onClick} style={[styles.stylizedButton, {backgroundColor, alignSelf: centered ? 'center' : 'flex-start'}]}>
		<Text style={styles.stylizedButtonText}>{text}</Text>
	</Pressable>
}

function SettingLabel({title, description, children}: {title: string, description?: string, children?: any}) {
	return <View style={styles.settingLabelContainer}>
		<Text style={styles.settingTitle}>{title}</Text>
		{description && <Text style={styles.settingDesc}>{description}</Text>}
		<View style={styles.settingLabelChildren}>
			{children}
		</View>
	</View>
}

const styles = StyleSheet.create({
	stylizedButton: {
		width: 160,
		height: 30,
		borderRadius: 6,
		justifyContent: 'center',
		alignItems: 'center',
		margin: 4
	},
	stylizedButtonText: {
		fontSize: 18,
		color: 'white',
		fontFamily: 'Silkscreen'
	},
	optionsView: {
		width: '81%',
		height: '70%',
		backgroundColor: 'rgba(5, 5, 5, 0.95)',
		borderRadius: 20,
		borderColor: 'rgb(90, 90, 90)',
		borderWidth: 2,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		zIndex: 100
	},
	settingLabelContainer: {
		width: '80%',
		height: 'auto',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		marginTop: 6,
		marginBottom: 6
	},
	settingLabelChildren: {
		width: 'auto',
		height: 'auto',
		position: 'absolute',
		alignSelf: 'flex-end',
		justifyContent: 'flex-end',
	},
	settingTitle: {
		color: 'white',
		fontSize: 16,
		fontFamily: 'Silkscreen'
	},
	settingDesc: {
		color: 'rgb(160, 160, 160)',
		fontSize: 8,
		fontFamily: 'Silkscreen'
	}
});