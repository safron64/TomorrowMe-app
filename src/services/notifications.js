import { Alert } from 'react-native'
import * as Notifications from 'expo-notifications'
import { API_BASE_URL } from '@env'

export async function loadNotificationSettings(user_id) {
	const res = await fetch(
		`${API_BASE_URL}/notifications/settings?user_id=${user_id}`
	)
	if (!res.ok) {
		throw new Error('Failed to fetch notification settings')
	}
	return await res.json()
}

export async function saveTimesNotification(user_id, times, item_type) {
	console.log(user_id, times)
	const res = await fetch(`${API_BASE_URL}/notifications`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ user_id, times, item_type }),
	})
	if (!res.ok) {
		throw new Error('Failed to save task times')
	}
}

export async function saveEventOffset(user_id, offset) {
	if (isNaN(offset) || offset < 0) {
		Alert.alert('Ошибка', 'Введите корректное кол-во минут.')
		return
	}

	// Превращаем offset (минуты) в миллисекунды
	const offsetMs = offset * 60 * 1000 // 10 -> 600000
	// Создаём массив объектов, как нужно бэкенду
	const timesArray = [{ offsetMs }] // [{ offsetMs: 600000 }] если offset=10

	try {
		const res = await fetch(`${API_BASE_URL}/notifications/events`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				user_id,
				times: timesArray,
			}),
		})

		if (!res.ok) {
			throw new Error('Failed to save event offset')
		}

		Alert.alert('Успешно', `Напоминание за ${offset} минут сохранено.`)
	} catch (error) {
		Alert.alert('Ошибка', 'Не удалось сохранить настройку.')
		console.error(error)
	}
}

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
})

export async function registerForPushNotificationsAsync(user_id) {
	// 1. Запрашиваем разрешения
	const { status: existingStatus } = await Notifications.getPermissionsAsync()
	let finalStatus = existingStatus

	// Если разрешения ещё не было
	if (existingStatus !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync()
		finalStatus = status
	}

	// Если пользователь не дал разрешение
	if (finalStatus !== 'granted') {
		console.log('Push notification permission not granted!')
		return
	}

	// 2. Получаем Expo push token
	const tokenData = await Notifications.getExpoPushTokenAsync()
	const expo_push_token = tokenData.data
	console.log('Получен expo_push_token:', expo_push_token)

	// 3. Отправляем этот токен на бэкенд, чтобы потом сервер мог пушить
	try {
		const response = await fetch(`${API_BASE_URL}/users/push-token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ user_id, expo_push_token }),
		})
		const result = await response.json()
		if (!response.ok) {
			console.error('Ошибка при обновлении push-токена:', result)
		} else {
			console.log('Push token успешно отправлен на бэкенд:', result)
		}
	} catch (error) {
		console.error('Сетевая ошибка при обновлении push-токена:', error)
	}
}
