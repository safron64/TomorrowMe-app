import { useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { API_BASE_URL } from '@env'
import { LayoutAnimation, Alert, Platform, UIManager } from 'react-native'

const STORAGE_KEY = 'calendarItems'

if (Platform.OS === 'android') {
	UIManager.setLayoutAnimationEnabledExperimental &&
		UIManager.setLayoutAnimationEnabledExperimental(true)
}

export function useCalendarLogic(user_id) {
	const [selectedDay, setSelectedDay] = useState(null)
	const [items, setItems] = useState({})
	const [markedDates, setMarkedDates] = useState({})
	const [loading, setLoading] = useState(true)

	// ---------------------------
	// Загрузка расписаний с сервера
	// ---------------------------
	const loadAllSchedulesFromServer = useCallback(async () => {
		if (!user_id) return
		try {
			const response = await axios.get(`${API_BASE_URL}/schedules`, {
				params: { user_id },
			})
			const schedules = response.data
			const newItems = {}

			schedules.forEach(sch => {
				const { activity, date, time_frame, schedule_id, end_time } =
					sch
				let startTime = '00:00'
				let endTimeParsed = '00:00'
				if (time_frame) {
					if (time_frame.includes('-')) {
						const parts = time_frame.split('-')
						startTime = parts[0].substring(0, 5)
						endTimeParsed = parts[1].substring(0, 5)
					} else {
						startTime = time_frame.substring(0, 5)
						if (end_time) {
							endTimeParsed = end_time.substring(0, 5)
						} else {
							endTimeParsed = startTime
						}
					}
				}

				if (!newItems[date]) newItems[date] = []
				newItems[date].push({
					id: schedule_id.toString(),
					name: activity,
					date,
					startTime,
					endTime: endTimeParsed,
				})
			})

			setItems(newItems)

			// Обновляем метку выбранной даты
			if (!selectedDay) {
				const today = new Date()
				const y = today.getFullYear()
				const m = (today.getMonth() + 1).toString().padStart(2, '0')
				const d = today.getDate().toString().padStart(2, '0')
				const dateStr = `${y}-${m}-${d}`
				setSelectedDay(dateStr)
				updateMarkedDates(newItems, dateStr)
			} else {
				updateMarkedDates(newItems, selectedDay)
			}

			// Сохраняем в AsyncStorage
			await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))

			// (Дополнительно) планируем уведомления
			await planEventNotifications(newItems)
		} catch (error) {
			console.error('Error loading schedules:', error.response?.data)
			Alert.alert('Ошибка', 'Не удалось загрузить расписания с сервера.')
		}
	}, [user_id, selectedDay])

	// ---------------------------
	// Чтение из AsyncStorage
	// ---------------------------
	const loadFromAsyncStorage = useCallback(async () => {
		try {
			const storedData = await AsyncStorage.getItem(STORAGE_KEY)
			if (storedData) {
				const parsedData = JSON.parse(storedData)
				setItems(parsedData)

				const today = new Date()
				const y = today.getFullYear()
				const m = (today.getMonth() + 1).toString().padStart(2, '0')
				const d = today.getDate().toString().padStart(2, '0')
				const dateStr = `${y}-${m}-${d}`
				setSelectedDay(dateStr)
				updateMarkedDates(parsedData, dateStr)
				setLoading(false)
			} else {
				setLoading(false)
			}
		} catch (error) {
			console.error('Error loading from AsyncStorage:', error)
			setLoading(false)
		}

		if (user_id) {
			await loadAllSchedulesFromServer()
		}
	}, [user_id, loadAllSchedulesFromServer])

	// ---------------------------
	// Планирование уведомлений (пример, если нужно)
	// ---------------------------
	async function planEventNotifications(updatedItems) {
		// Здесь можно реализовать логику планирования уведомлений
		// Пример: await scheduleEventNotification(event, eventOffset);
	}

	// ---------------------------
	// Обновить выделенные даты на календаре
	// ---------------------------
	function updateMarkedDates(data = items, day = selectedDay) {
		const newMarked = {}
		for (const dayKey in data) {
			if (data[dayKey] && data[dayKey].length > 0) {
				newMarked[dayKey] = {
					marked: true,
					dots: [
						{
							key: 'event',
							color: '#0a84ff',
							selectedDotColor: '#0a84ff',
						},
					],
					...(dayKey === day
						? { selected: true, selectedColor: '#0a84ff' }
						: {}),
				}
			} else {
				if (dayKey === day) {
					newMarked[dayKey] = {
						selected: true,
						selectedColor: '#0a84ff',
					}
				}
			}
		}

		// Если у выбранного дня нет событий, всё равно подсвечиваем
		if (day && !newMarked[day]) {
			newMarked[day] = {
				selected: true,
				selectedColor: '#0a84ff',
			}
		}
		setMarkedDates(newMarked)
	}

	// ---------------------------
	// Сохранить (создать/редактировать) событие
	// ---------------------------
	async function saveEvent({
		editMode,
		currentEventId,
		eventName,
		eventStartTime,
		eventEndTime,
	}) {
		if (!user_id) {
			Alert.alert('Ошибка', 'user_id не найден.')
			return
		}
		if (!eventName.trim()) {
			Alert.alert('Ошибка', 'Введите название события.')
			return
		}
		if (!eventStartTime.trim() || !eventEndTime.trim()) {
			Alert.alert('Ошибка', 'Выберите время начала и окончания события.')
			return
		}
		if (eventStartTime >= eventEndTime) {
			Alert.alert(
				'Ошибка',
				'Время окончания должно быть позже времени начала.'
			)
			return
		}

		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

		const time_frame = `${eventStartTime}-${eventEndTime}`
		try {
			if (editMode && currentEventId) {
				// Редактирование
				await axios.put(
					`${API_BASE_URL}/schedules/${currentEventId}`,
					{
						activity: eventName,
						date: selectedDay,
						time_frame,
					},
					{
						params: { user_id },
					}
				)
			} else {
				// Создание
				await axios.post(
					`${API_BASE_URL}/schedules`,
					{
						activity: eventName,
						date: selectedDay,
						time_frame,
					},
					{
						params: { user_id },
					}
				)
			}
			// После сохранения снова загружаем все расписания
			await loadAllSchedulesFromServer()
		} catch (error) {
			console.error('Error saving event:', error)
			Alert.alert('Ошибка', 'Не удалось сохранить событие.')
		}
	}

	// ---------------------------
	// Удалить событие
	// ---------------------------
	async function deleteEvent(eventId) {
		if (!user_id) {
			Alert.alert('Ошибка', 'user_id не найден.')
			return
		}
		Alert.alert(
			'Удаление события',
			'Вы уверены, что хотите удалить это событие?',
			[
				{ text: 'Отмена', style: 'cancel' },
				{
					text: 'Удалить',
					style: 'destructive',
					onPress: async () => {
						LayoutAnimation.configureNext(
							LayoutAnimation.Presets.easeInEaseOut
						)
						try {
							await axios.delete(
								`${API_BASE_URL}/schedules/${eventId}`,
								{
									params: { user_id },
								}
							)
							await loadAllSchedulesFromServer()
						} catch (error) {
							console.error(
								'Error deleting event:',
								error.response?.data
							)
							Alert.alert('Ошибка', 'Не удалось удалить событие.')
						}
					},
				},
			]
		)
	}

	return {
		selectedDay,
		setSelectedDay,
		items,
		markedDates,
		loading,
		loadFromAsyncStorage,
		updateMarkedDates,
		saveEvent,
		deleteEvent,
	}
}
