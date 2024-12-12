import React from 'react'
import AppNavigator from './navigation/AppNavigator'
import { UserProvider } from './context/UserContext'
import { Platform } from 'react-native'

export default function App() {
	return (
		<UserProvider>
			<AppNavigator />
		</UserProvider>
	)
}
