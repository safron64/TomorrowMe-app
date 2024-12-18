import React, { useState, useEffect } from 'react'
import { Alert, ScrollView } from 'react-native'
import styled from 'styled-components/native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import {
	loadNotificationSettings,
	saveTaskTimes,
	saveEventOffset,
	TASK_TIMES_KEY,
	EVENT_OFFSET_KEY,
} from '../services/storage'

const NotificationSettingsScreen = () => {
	const [taskNotificationTimes, setTaskNotificationTimes] = useState([])
	const [eventReminderOffset, setEventReminderOffset] = useState('5')
	const [isTimePickerVisible, setTimePickerVisible] = useState(false)

	useEffect(() => {
		const loadSettings = async () => {
			const { taskTimes, eventOffset } = await loadNotificationSettings()
			setTaskNotificationTimes(taskTimes)
			setEventReminderOffset(eventOffset.toString())
		}
		loadSettings()
	}, [])

	const showTimePicker = () => {
		setTimePickerVisible(true)
	}

	const hideTimePicker = () => {
		setTimePickerVisible(false)
	}

	const handleConfirmTime = date => {
		const hours = date.getHours().toString().padStart(2, '0')
		const minutes = date.getMinutes().toString().padStart(2, '0')
		const timeStr = `${hours}:${minutes}`

		if (!taskNotificationTimes.includes(timeStr)) {
			setTaskNotificationTimes([...taskNotificationTimes, timeStr])
		} else {
			Alert.alert('Внимание', 'Это время уже добавлено.')
		}

		hideTimePicker()
	}

	const removeTaskTime = time => {
		setTaskNotificationTimes(taskNotificationTimes.filter(t => t !== time))
	}

	const handleSaveTaskTimes = async () => {
		try {
			await saveTaskTimes(taskNotificationTimes)
			Alert.alert('Успешно', 'Времена уведомлений для задач сохранены.')
		} catch (error) {
			Alert.alert('Ошибка', 'Не удалось сохранить времена уведомлений.')
		}
	}

	const handleSaveEventOffset = async () => {
		const offset = parseInt(eventReminderOffset, 10)
		if (isNaN(offset) || offset < 0) {
			Alert.alert(
				'Ошибка',
				'Пожалуйста, введите корректное количество минут.'
			)
			return
		}
		try {
			await saveEventOffset(offset)
			Alert.alert('Успешно', `Напоминание за ${offset} минут сохранено.`)
		} catch (error) {
			Alert.alert('Ошибка', 'Не удалось сохранить настройку.')
		}
	}

	return (
		<Container>
			<ScrollView>
				<Section>
					<SectionTitle>Уведомления для задач</SectionTitle>
					<SectionDescription>
						Здесь вы можете настроить конкретные моменты времени, в
						которые вы будете получать уведомления о задачах.
					</SectionDescription>

					{taskNotificationTimes.length > 0 && (
						<TimesList>
							{taskNotificationTimes.map((time, index) => (
								<TimeItem key={index}>
									<TimeText>{time}</TimeText>
									<RemoveButton
										onPress={() => removeTaskTime(time)}
									>
										<RemoveButtonText>
											Удалить
										</RemoveButtonText>
									</RemoveButton>
								</TimeItem>
							))}
						</TimesList>
					)}

					<AddTimeButton onPress={showTimePicker}>
						<AddTimeButtonText>Добавить время</AddTimeButtonText>
					</AddTimeButton>

					<SaveButton onPress={handleSaveTaskTimes}>
						<SaveButtonText>Сохранить</SaveButtonText>
					</SaveButton>
				</Section>

				<Section>
					<SectionTitle>Уведомления для событий</SectionTitle>
					<SectionDescription>
						Укажите за сколько минут до начала события присылать
						уведомление.
					</SectionDescription>

					<Input
						placeholder="Например: 5"
						value={eventReminderOffset}
						onChangeText={setEventReminderOffset}
						keyboardType="numeric"
						placeholderTextColor="#888"
					/>

					<SaveButton onPress={handleSaveEventOffset}>
						<SaveButtonText>Сохранить</SaveButtonText>
					</SaveButton>
				</Section>
			</ScrollView>

			<DateTimePickerModal
				isVisible={isTimePickerVisible}
				mode="time"
				onConfirm={handleConfirmTime}
				onCancel={hideTimePicker}
				headerTextIOS="Выберите время уведомления"
				confirmTextIOS="Выбрать"
				cancelTextIOS="Отмена"
				locale="ru"
			/>
		</Container>
	)
}

export default NotificationSettingsScreen

// Стили
const Container = styled.View`
	flex: 1;
	background-color: #000;
	padding: 20px;
	padding-top: 50px;
`

const Section = styled.View`
	margin-bottom: 30px;
`

const SectionTitle = styled.Text`
	color: #fff;
	font-size: 24px;
	font-weight: bold;
	margin-bottom: 10px;
`

const SectionDescription = styled.Text`
	color: #aaa;
	font-size: 16px;
	margin-bottom: 20px;
`

const TimesList = styled.View`
	margin-bottom: 20px;
`

const TimeItem = styled.View`
	background-color: #1c1c1e;
	padding: 10px;
	border-radius: 5px;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 10px;
`

const TimeText = styled.Text`
	color: #fff;
	font-size: 18px;
`

const RemoveButton = styled.TouchableOpacity`
	padding: 5px 10px;
	background-color: #ff3b30;
	border-radius: 5px;
`

const RemoveButtonText = styled.Text`
	color: #fff;
	font-weight: bold;
`

const AddTimeButton = styled.TouchableOpacity`
	background-color: #0a84ff;
	padding: 10px 15px;
	border-radius: 5px;
	align-items: center;
	margin-bottom: 20px;
`

const AddTimeButtonText = styled.Text`
	color: #fff;
	font-weight: bold;
	font-size: 16px;
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

const Input = styled.TextInput`
	border: 1px solid #444;
	border-radius: 5px;
	padding: 10px;
	color: #fff;
	margin-bottom: 15px;
	font-size: 16px;
`
