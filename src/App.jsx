import React, { useContext, useEffect } from 'react'
import AppNavigator from './navigation/AppNavigator'
import { UserContext, UserProvider } from './context/UserContext'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as Notifications from 'expo-notifications'

SplashScreen.preventAutoHideAsync() // Предотвращаем автоматическое скрытие Splash Screen

export default function App() {
	useEffect(() => {
		async function loadApp() {
			try {
				// Выполните все необходимые асинхронные операции
				console.log('Загрузка приложения...')
				// Например, загрузка шрифтов или данных
			} catch (e) {
				console.warn(e)
			} finally {
				await SplashScreen.hideAsync() // Скрываем Splash Screen
			}
		}

		loadApp()
	}, [])

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<UserProvider>
				<AppNavigator />
			</UserProvider>
		</GestureHandlerRootView>
	)
}
