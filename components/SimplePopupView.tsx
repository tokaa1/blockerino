import { View } from "react-native";

export default function SimplePopupView({children, style}: {children: any, style?: any[]}) {
	if (style == undefined)
		style = [];
    return <View style={[{
		width: '81%',
		height: '71%',
		backgroundColor: 'rgba(5, 5, 5, 0.95)',
		borderRadius: 20,
		borderColor: 'rgb(90, 90, 90)',
		borderWidth: 2,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		zIndex: 100,
        overflowY: 'scroll',
		boxSizing: 'border-box'
	}, ...style]}>{children}</View>
}