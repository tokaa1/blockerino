import { cssColors } from "@/constants/Color";
import { MenuStateType, useAppState, useAppStateValue } from "@/hooks/useAppState";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import SimplePopupView from "./SimplePopupView";
import StylizedButton from "./StylizedButton";

export default function OptionsMenu() {
	const [ appState, setAppState, _appendAppState, popAppState ] = useAppState();

	return <SimplePopupView>
		<StylizedButton onClick={popAppState} text="Back" backgroundColor={cssColors.spaceGray}></StylizedButton>
		{ appState.containsGameMode() && 
			<StylizedButton onClick={() => { setAppState(MenuStateType.MENU) }} text="Quit Run" backgroundColor={cssColors.brightNiceRed}></StylizedButton>
		}
	</SimplePopupView>
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