import React, { useState, useEffect, useContext, useCallback } from 'react'
import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	TextInput,
	Alert,
	FlatList,
	LayoutAnimation,
	UIManager,
	Platform,
	ActivityIndicator,
} from 'react-native'
import styled from 'styled-components/native'
import { Calendar } from 'react-native-calendars'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from 'axios'
import { API_BASE_URL } from '@env'
import { UserContext } from '../context/UserContext'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { loadNotificationSettings } from '../services/storage'
import { Dimensions } from 'react-native'
const SCREEN_WIDTH = Dimensions.get('window').width

if (Platform.OS === 'android') {
	UIManager.setLayoutAnimationEnabledExperimental &&
		UIManager.setLayoutAnimationEnabledExperimental(true)
}

const STORAGE_KEY = 'calendarItems' // ключ для AsyncStorage

const CalendarScreen = () => {
	const { user } = useContext(UserContext)
	const user_id = user ? user.user_id : null

	const [selectedDay, setSelectedDay] = useState(null)
	const [items, setItems] = useState({})
	const [markedDates, setMarkedDates] = useState({})
	const [loading, setLoading] = useState(true)

	const [modalVisible, setModalVisible] = useState(false)
	const [editMode, setEditMode] = useState(false)
	const [currentEventId, setCurrentEventId] = useState(null)
	const [eventName, setEventName] = useState('')
	const [eventStartTime, setEventStartTime] = useState('')
	const [eventEndTime, setEventEndTime] = useState('')

	useFocusEffect(
		useCallback(() => {
			let isActive = true

			const loadFromAsyncStorage = async () => {
				try {
					const storedData = await AsyncStorage.getItem(STORAGE_KEY)
					if (storedData) {
						const parsedData = JSON.parse(storedData)
						if (isActive) {
							setItems(parsedData)
							const today = new Date()
							const y = today.getFullYear()
							const m = (today.getMonth() + 1)
								.toString()
								.padStart(2, '0')
							const d = today
								.getDate()
								.toString()
								.padStart(2, '0')
							const dateStr = `${y}-${m}-${d}`
							setSelectedDay(dateStr)
							updateMarkedDates(parsedData, dateStr)
							setLoading(false)
						}
					} else {
						setLoading(false)
					}
				} catch (error) {
					console.error('Error loading from AsyncStorage:', error)
					setLoading(false)
				}
				// После загрузки локальных данных — обновим с сервера
				if (user_id) {
					await loadAllSchedulesFromServer()
				}
			}

			loadFromAsyncStorage()

			return () => {
				isActive = false
			}
		}, [user_id])
	)

	async function planEventNotifications(items) {
		const { eventOffset } = await loadNotificationSettings()
		// Если у вас нет планировщика уведомлений, можно закомментировать данный цикл
		for (const dateKey in items) {
			for (const ev of items[dateKey]) {
				// Здесь вы могли бы вызвать scheduleEventNotification.
			}
		}
	}

	const loadAllSchedulesFromServer = async () => {
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
			const today = new Date()
			const y = today.getFullYear()
			const m = (today.getMonth() + 1).toString().padStart(2, '0')
			const d = today.getDate().toString().padStart(2, '0')
			const dateStr = `${y}-${m}-${d}`
			if (!selectedDay) {
				setSelectedDay(dateStr)
			}
			updateMarkedDates(newItems, selectedDay || dateStr)

			await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))
			await planEventNotifications(newItems)
		} catch (error) {
			console.error('Error loading schedules:', error.response?.data)
			Alert.alert('Ошибка', 'Не удалось загрузить расписания с сервера.')
		}
	}

	const updateMarkedDates = (data = items, day = selectedDay) => {
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

		if (day && !newMarked[day]) {
			newMarked[day] = {
				selected: true,
				selectedColor: '#0a84ff',
			}
		}

		setMarkedDates(newMarked)
	}

	const openNewEventModal = () => {
		if (!selectedDay) {
			Alert.alert('Ошибка', 'Сначала выберите дату')
			return
		}
		setEditMode(false)
		setCurrentEventId(null)
		setEventName('')
		setEventStartTime('')
		setEventEndTime('')
		setModalVisible(true)
	}

	const openEditEventModal = event => {
		setEditMode(true)
		setCurrentEventId(event.id)
		setEventName(event.name)
		setEventStartTime(event.startTime)
		setEventEndTime(event.endTime)
		setModalVisible(true)
	}

	const saveEvent = async () => {
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
			let response
			if (editMode && currentEventId) {
				console.log('put')
				response = await axios.put(
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
				console.log(selectedDay, time_frame)
				response = await axios.post(
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

			// Обновляем с сервера снова (или можно обновить локально items)
			await loadAllSchedulesFromServer()

			setModalVisible(false)
		} catch (error) {
			console.error('Error saving event:', error)
			Alert.alert('Ошибка', 'Не удалось сохранить событие.')
		}
	}

	const deleteEvent = async eventId => {
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

	const dayEvents =
		selectedDay && items[selectedDay] ? [...items[selectedDay]] : []
	dayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime))

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
			<Header>
				<Title>Календарь</Title>
				<AddButton onPress={openNewEventModal}>
					<Ionicons name="add" size={24} color="#0a84ff" />
				</AddButton>
			</Header>

			{loading ? (
				<LoaderContainer>
					<ActivityIndicator size="large" color="#0a84ff" />
				</LoaderContainer>
			) : (
				<>
					<Calendar
						onDayPress={day => {
							setSelectedDay(day.dateString)
							updateMarkedDates(items, day.dateString)
						}}
						markedDates={markedDates}
						theme={{
							backgroundColor: '#000',
							calendarBackground: '#000',
							textSectionTitleColor: '#fff',
							dayTextColor: '#fff',
							todayTextColor: '#0a84ff',
							selectedDayBackgroundColor: '#0a84ff',
							selectedDayTextColor: '#fff',
							monthTextColor: '#fff',
							arrowColor: '#0a84ff',
						}}
						style={{ backgroundColor: '#000' }}
					/>

					<EventsContainer>
						<FlatList
							data={dayEvents}
							keyExtractor={item => item.id}
							ListEmptyComponent={() => (
								<EmptyText>Событий нет</EmptyText>
							)}
							renderItem={({ item }) => (
								<EventItem>
									<EventText>
										{item.name} - {item.startTime}
										{item.endTime !== item.startTime
											? ` - ${item.endTime}`
											: ''}
									</EventText>
									<ButtonsRow>
										<EditButton
											onPress={() =>
												openEditEventModal(item)
											}
										>
											<Ionicons
												name="pencil"
												size={20}
												color="#0a84ff"
											/>
										</EditButton>
										<DeleteButton
											onPress={() => deleteEvent(item.id)}
										>
											<Ionicons
												name="trash"
												size={20}
												color="#ff3b30"
											/>
										</DeleteButton>
									</ButtonsRow>
								</EventItem>
							)}
						/>
					</EventsContainer>
				</>
			)}

			<Modal
				visible={modalVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setModalVisible(false)}
			>
				<ModalContainer>
					<ModalContent>
						<ModalHeader>
							<ModalTitle>
								{editMode
									? 'Редактировать событие'
									: 'Новое событие'}
							</ModalTitle>
							<CloseButton onPress={() => setModalVisible(false)}>
								<Ionicons
									name="close"
									size={24}
									color="#0a84ff"
								/>
							</CloseButton>
						</ModalHeader>
						<ModalInput
							value={eventName}
							onChangeText={text => setEventName(text)}
							placeholder="Название события"
							placeholderTextColor="#888"
						/>
						<ModalInput
							value={eventStartTime}
							onChangeText={text => setEventStartTime(text)}
							placeholder="Время начала (HH:MM)"
							placeholderTextColor="#888"
							// keyboardType="numeric"ф
						/>
						<ModalInput
							value={eventEndTime}
							onChangeText={text => setEventEndTime(text)}
							placeholder="Время окончания (HH:MM)"
							placeholderTextColor="#888"
							// keyboardType="numeric"
						/>

						<SaveButton onPress={saveEvent}>
							<SaveButtonText>Сохранить</SaveButtonText>
						</SaveButton>
					</ModalContent>
				</ModalContainer>
			</Modal>
		</SafeAreaView>
	)
}

export default CalendarScreen

const Header = styled.View`
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding: 10px;
`

const Title = styled.Text`
	color: #fff;
	font-size: 28px;
	font-weight: bold;
`

const AddButton = styled.TouchableOpacity`
	background-color: #1c1c1e;
	padding: 10px;
	border-radius: 5px;
`

const EventsContainer = styled.View`
	flex: 1;
	background-color: #000;
	padding: 20px;
`

const EmptyText = styled.Text`
	color: #888;
	text-align: center;
	margin-top: 20px;
`

const EventItem = styled.View`
	background-color: #1c1c1e;
	padding: 10px;
	border-radius: 5px;
	margin-bottom: 10px;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
`

const EventText = styled.Text`
	color: #fff;
	padding-right: 30px;
	flex-wrap: wrap;
	max-width: ${SCREEN_WIDTH - 100}px;
`

const ButtonsRow = styled.View`
	flex-direction: row;
	align-items: center;
`

const EditButton = styled.TouchableOpacity`
	margin-right: 15px;
`

const DeleteButton = styled.TouchableOpacity``

const ModalContainer = styled.View`
	flex: 1;
	background-color: rgba(0, 0, 0, 0.7);
	justify-content: center;
	align-items: center;
`

const ModalContent = styled.View`
	background-color: #1c1c1e;
	width: 90%;
	padding: 20px;
	border-radius: 10px;
`

const ModalHeader = styled.View`
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
`

const ModalTitle = styled.Text`
	color: #fff;
	font-size: 20px;
	font-weight: bold;
`

const CloseButton = styled.TouchableOpacity`
	padding: 5px;
`

const ModalInput = styled.TextInput`
	border: 1px solid #444;
	border-radius: 5px;
	padding: 10px;
	color: #fff;
	margin-bottom: 20px;
`

const SaveButton = styled.TouchableOpacity`
	background-color: #0a84ff;
	padding: 15px;
	border-radius: 5px;
	align-items: center;
	margin-top: 10px;
`

const SaveButtonText = styled.Text`
	color: #fff;
	font-weight: bold;
	font-size: 18px;
`

const LoaderContainer = styled.View`
	flex: 1;
	justify-content: center;
	align-items: center;
	background-color: #000;
`
