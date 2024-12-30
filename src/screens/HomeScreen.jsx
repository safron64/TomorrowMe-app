// screens/HomeScreen.js
import React, { useContext } from 'react'
import { View, Text, Button, Alert, Platform } from 'react-native'
import { UserContext } from '../context/UserContext'
import { useNavigation } from '@react-navigation/native'
import * as Notifications from 'expo-notifications'

import { usePushNotifications } from '../hooks/usePushNotifications'

const HomeScreen = () => {
	const { user, logout } = useContext(UserContext)
	const navigation = useNavigation()

	// Вызываем кастомный хук
	const { expoPushToken, notification } = usePushNotifications(user?.user_id)

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

			<Text style={{ color: '#fff', marginBottom: 10 }}>
				Текущий токен: {expoPushToken}
			</Text>
			{notification && (
				<Text style={{ color: '#fff', marginBottom: 10 }}>
					Последнее уведомление: {notification.request.content.body}
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
