// hooks/usePushNotifications.js
import { useState, useEffect, useRef } from 'react'
import { Alert, Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import axios from 'axios'
import { API_BASE_URL } from '@env'

// Устанавливаем поведение: когда приходит уведомление, как его обрабатывать
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: true,
		shouldShowAlert: true,
		shouldSetBadge: false,
	}),
})

/**
 * Кастомный хук для работы с Expo Push Notifications.
 * - запрашивает разрешение
 * - получает токен
 * - (если есть user_id) отправляет на бэкенд
 * - подписывается на события уведомлений
 *
 * Возвращает объект:
 * {
 *   expoPushToken,  // строка-токен, например "ExponentPushToken[xxxxx]"
 *   notification,   // последнее уведомление, которое прилетело
 * }
 */
export function usePushNotifications(user_id) {
	const [expoPushToken, setExpoPushToken] = useState(null)
	const [notification, setNotification] = useState(null)

	const notificationListener = useRef()
	const responseListener = useRef()

	// Запрашиваем разрешение и получаем токен
	async function registerForPushNotificationsAsync() {
		// 1. Проверяем, реальное ли устройство
		if (!Device.isDevice) {
			Alert.alert(
				'Уведомления',
				'Push уведомления доступны только на реальном устройстве'
			)
			return null
		}

		// 2. Проверяем/запрашиваем разрешение
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
				'Разрешение на пуш-уведомления не предоставлено.'
			)
			return null
		}

		// 3. Получаем токен
		// В случае EAS project, иногда нужно передавать projectId: ...
		// (если у вас в Constants.expoConfig?.extra?.eas.projectId есть данные)
		// Ниже пример без projectId:
		const tokenData = await Notifications.getExpoPushTokenAsync({
			projectId: Constants.expoConfig?.extra?.eas?.projectId,
		})
		const token = tokenData.data
		console.log('Получен Expo Push Token:', token)

		// 4. Android-канал
		if (Platform.OS === 'android') {
			await Notifications.setNotificationChannelAsync('default', {
				name: 'default',
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: '#FF231F7C',
				sound: 'default',
			})
		}

		return token
	}

	// Хук useEffect для инициализации пушей
	useEffect(() => {
		// Запрашиваем токен
		registerForPushNotificationsAsync().then(token => {
			if (token) {
				setExpoPushToken(token)
				// Если есть user_id, отправляем на бэкенд
				if (user_id) {
					sendPushTokenToBackend(user_id, token)
				}
			}
		})

		// Подписываемся на события
		notificationListener.current =
			Notifications.addNotificationReceivedListener(notification => {
				Vibration.vibrate([0, 250, 250, 250])
				setNotification(notification)
			})

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener(response => {
				// Когда пользователь нажал на уведомление
				console.log('Пользователь кликнул на уведомление:', response)
			})

		// Чистим подписки при размонтировании
		return () => {
			if (notificationListener.current) {
				Notifications.removeNotificationSubscription(
					notificationListener.current
				)
			}
			if (responseListener.current) {
				Notifications.removeNotificationSubscription(
					responseListener.current
				)
			}
		}
	}, [user_id])

	// Функция: отправить токен на бэкенд
	async function sendPushTokenToBackend(userId, token) {
		try {
			await axios.post(`${API_BASE_URL}/user/push-token`, {
				user_id: userId,
				token,
			})
			console.log('Push token успешно отправлен на бэкенд')
		} catch (error) {
			console.error('Ошибка при отправке push-токена на бэкенд:', error)
		}
	}

	return {
		expoPushToken,
		notification,
	}
}
