import AsyncStorage from '@react-native-async-storage/async-storage'

export const TASK_TIMES_KEY = 'taskNotificationTimes'
export const STORAGE_KEY = 'calendarItems'
export const EVENT_OFFSET_KEY = 'eventReminderOffset'

export async function loadNotificationSettings() {
	const savedTaskTimes = await AsyncStorage.getItem(TASK_TIMES_KEY)
	const savedEventOffset = await AsyncStorage.getItem(EVENT_OFFSET_KEY)

	let taskTimes = []
	if (savedTaskTimes) {
		taskTimes = JSON.parse(savedTaskTimes) // массив строк вида "HH:MM"
	}

	let eventOffset = 5 // по умолчанию 5 минут
	if (savedEventOffset) {
		eventOffset = parseInt(savedEventOffset, 10) || 5
	}

	return { taskTimes, eventOffset }
}

export async function saveTaskTimes(taskTimes) {
	await AsyncStorage.setItem(TASK_TIMES_KEY, JSON.stringify(taskTimes))
}

export async function saveEventOffset(offset) {
	await AsyncStorage.setItem(EVENT_OFFSET_KEY, offset.toString())
}

export const saveSchedulesToStorage = async data => {
	try {
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data))
	} catch (error) {
		console.error('Ошибка при сохранении в AsyncStorage:', error)
	}
}

export const loadSchedulesFromStorage = async () => {
	try {
		const storedData = await AsyncStorage.getItem(STORAGE_KEY)
		return storedData ? JSON.parse(storedData) : {}
	} catch (error) {
		console.error('Ошибка при загрузке из AsyncStorage:', error)
		return {}
	}
}
