import { Platform, Alert } from 'react-native'
import * as Notifications from 'expo-notifications'

export async function requestPermissions() {
	if (Platform.OS === 'web') {
		Alert.alert('Недоступно', 'Уведомления недоступны на веб-платформе.')
		return
	}

	const { status } = await Notifications.requestPermissionsAsync()
	if (status !== 'granted') {
		Alert.alert(
			'Внимание',
			'Разрешение на отправку уведомлений не было предоставлено.'
		)
	}
}

// Планирование уведомлений для задач на определенное время каждый день
export async function scheduleDailyTaskNotifications(taskTimes) {
	if (Platform.OS === 'web') {
		Alert.alert('Недоступно', 'Уведомления недоступны на веб-платформе.')
		return
	}

	// Отменяем старые уведомления при необходимости
	// Например:
	// await Notifications.cancelAllScheduledNotificationsAsync()

	for (let timeStr of taskTimes) {
		const [hours, minutes] = timeStr.split(':').map(Number)
		await Notifications.scheduleNotificationAsync({
			content: {
				title: 'Напоминание о задачах',
				body: 'Пора проверить ваш список задач!',
			},
			trigger: {
				hour: hours,
				minute: minutes,
				repeats: true, // ежедневное повторение
			},
		})
	}
}

// Планирование уведомления для события, за eventOffset минут до начала
export async function scheduleEventNotification(
	eventDate,
	eventOffset,
	eventName
) {
	if (Platform.OS === 'web') {
		Alert.alert('Недоступно', 'Уведомления недоступны на веб-платформе.')
		return
	}

	const notificationTime = new Date(eventDate.getTime() - eventOffset * 60000)

	if (notificationTime <= new Date()) {
		// Время уже прошло, уведомление не имеет смысла
		return
	}

	await Notifications.scheduleNotificationAsync({
		content: {
			title: 'Напоминание о событии',
			body: `Событие "${eventName}" начнется через ${eventOffset} минут.`,
		},
		trigger: {
			date: notificationTime,
		},
	})
}
