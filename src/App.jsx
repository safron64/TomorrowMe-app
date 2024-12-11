import React from 'react'
import AppNavigator from './navigation/AppNavigator'
import { UserProvider } from './context/UserContext'
import { Platform } from 'react-native'

if (Platform.OS === 'android') {
	UIManager.setLayoutAnimationEnabledExperimental &&
		UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function App() {
	return (
		<UserProvider>
			<AppNavigator />
		</UserProvider>
	)
}
