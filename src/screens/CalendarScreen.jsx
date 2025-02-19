import React, { useState, useContext, useCallback } from 'react'
import { SafeAreaView, ActivityIndicator, FlatList, Alert } from 'react-native'
import styled from 'styled-components/native'
import { Calendar } from 'react-native-calendars'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'

import { UserContext } from '../context/UserContext'

// Наши кастомные хуки
import { useCalendarLogic } from '../hooks/useCalendarLogic'
import { useHabitsLogic } from '../hooks/useHabitsLogic'

// Подкомпоненты
import EventModal from '../components/Calendar/EventModal'
import NotificationModal from '../components/Calendar/NotificationModal'
import HabitsDropdown from '../components/Calendar/HabitsDropdown'
import EventItem from '../components/Calendar/EventItem'

export default function CalendarScreen() {
	const { user } = useContext(UserContext)
	const user_id = user ? user.user_id : null

	const {
		selectedDay,
		setSelectedDay,
		items,
		markedDates,
		loading,
		loadFromAsyncStorage,
		updateMarkedDates,
		saveEvent,
		deleteEvent,
	} = useCalendarLogic(user_id)

	const {
		habits,
		dropdownVisible,
		completedHabits,
		notificationModalVisible,
		selectedHabit,
		loadHabits,
		handleCheckHabit,
		toggleDropdown,
		openNotificationModal,
		closeNotificationModal,
		saveNotificationSettings,
	} = useHabitsLogic(user_id)

	const [modalVisible, setModalVisible] = useState(false)
	const [editMode, setEditMode] = useState(false)
	const [currentEventId, setCurrentEventId] = useState(null)
	const [eventName, setEventName] = useState('')
	const [eventStartTime, setEventStartTime] = useState('')
	const [eventEndTime, setEventEndTime] = useState('')

	useFocusEffect(
		useCallback(() => {
			let isActive = true
			if (isActive) {
				loadFromAsyncStorage()
				loadHabits()
			}
			return () => {
				isActive = false
			}
		}, [loadFromAsyncStorage, loadHabits])
	)

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

	const handleSaveEvent = async () => {
		await saveEvent({
			editMode,
			currentEventId,
			eventName,
			eventStartTime,
			eventEndTime,
		})
		setModalVisible(false)
	}

	const handleDeleteEvent = async eventId => {
		await deleteEvent(eventId)
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
								<EventItem
									event={item}
									onEdit={() => openEditEventModal(item)}
									onDelete={() => handleDeleteEvent(item.id)}
								/>
							)}
						/>

						{/* Выпадающий список привычек */}
						<HabitsDropdown
							habits={habits}
							dropdownVisible={dropdownVisible}
							completedHabits={completedHabits}
							onToggleDropdown={toggleDropdown}
							onCheckHabit={handleCheckHabit}
							onOpenNotificationModal={openNotificationModal}
						/>
					</EventsContainer>
				</>
			)}

			{/* Модальное окно уведомлений для привычек */}
			<NotificationModal
				visible={notificationModalVisible}
				userId={user_id}
				habitDescription={selectedHabit?.habit_description}
				onSave={saveNotificationSettings}
				onClose={closeNotificationModal}
			/>

			{/* Модальное окно для событий */}
			<EventModal
				modalVisible={modalVisible}
				editMode={editMode}
				eventName={eventName}
				eventStartTime={eventStartTime}
				eventEndTime={eventEndTime}
				setEventName={setEventName}
				setEventStartTime={setEventStartTime}
				setEventEndTime={setEventEndTime}
				onSave={handleSaveEvent}
				onClose={() => setModalVisible(false)}
			/>
		</SafeAreaView>
	)
}

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

const LoaderContainer = styled.View`
	flex: 1;
	justify-content: center;
	align-items: center;
	background-color: #000;
`

const EmptyText = styled.Text`
	color: #888;
	text-align: center;
	margin-top: 20px;
`
