// screens/HomeScreen.js

import React, { useContext, useEffect, useState } from 'react'
import { View, Text, Button, Alert, Platform } from 'react-native'
import { UserContext } from '../context/UserContext'
import { useNavigation } from '@react-navigation/native'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'

// Устанавливаем обработчик уведомлений.
// Лучше вынести это в App.js, чтобы настроить один раз для всего приложения.


const HomeScreen = () => {
	const { user, logout } = useContext(UserContext)
	const navigation = useNavigation()
	const [expoPushToken, setExpoPushToken] = useState(null)

	useEffect(() => {
		registerForPushNotificationsAsync().then(token => {
			setExpoPushToken(token)
		})
	}, [])

	const registerForPushNotificationsAsync = async () => {
		let token
		if (Constants.isDevice) {
			const { status: existingStatus } =
				await Notifications.getPermissionsAsync()
			let finalStatus = existingStatus
			if (existingStatus !== 'granted') {
				const { status } = await Notifications.requestPermissionsAsync()
				finalStatus = status
			}
			if (finalStatus !== 'granted') {
				Alert.alert(
					'Внимание',
					'Разрешение на отправку уведомлений не предоставлено.'
				)
				return
			}
			token = (await Notifications.getExpoPushTokenAsync()).data
			console.log('Expo Push Token:', token)
		} 

		if (Platform.OS === 'android') {
			await Notifications.setNotificationChannelAsync('default', {
				name: 'default',
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: '#FF231F7C',
			})
		}

		return token
	}

	const sendTestNotification = async () => {
		try {
			await Notifications.presentNotificationAsync({
				content: {
					title: 'Тестовое уведомление',
					body: 'Это тестовое уведомление отправлено немедленно!',
				},
			})
			Alert.alert('Успешно', 'Тестовое уведомление отправлено!')
		} catch (error) {
			console.error('Ошибка при отправке уведомления:', error)
			Alert.alert('Ошибка', 'Не удалось отправить уведомление.')
		}
	}

	const handleLogout = async () => {
		await logout()
	}

	return (
		<View style={{ flex: 1, backgroundColor: '#000', padding: 20 }}>
			{user ? (
				<Text style={{ color: '#fff', fontSize: 24, marginBottom: 20 }}>
					Добро пожаловать, {user.first_name}!
				</Text>
			) : (
				<Text style={{ color: '#fff', fontSize: 24, marginBottom: 20 }}>
					Загрузка...
				</Text>
			)}
			<Button
				style={{ marginBottom: 20 }}
				title="Уведомления"
				onPress={() => navigation.navigate('NotificationSettings')}
			/>
			<Button title="Выйти" onPress={handleLogout} />
			<Button
				title="Отправить тестовое уведомление"
				onPress={sendTestNotification}
			/>
		</View>
	)
}

export default HomeScreen
