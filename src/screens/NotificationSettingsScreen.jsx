import React, { useState, useEffect, useContext } from 'react'
import { Alert, ScrollView } from 'react-native'
import styled from 'styled-components/native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import moment from 'moment'

import {
	loadNotificationSettings,
	saveTaskTimes, // При сохранении daily для задач
	saveEventOffset, // При сохранении before_due (offset) для schedule
} from '../services/notifications'
import { UserContext } from '../context/UserContext'

function formatISOToTime(isoString) {
	const m = moment(isoString)
	if (!m.isValid()) return isoString
	return m.format('HH:mm')
}

const NotificationSettingsScreen = () => {
	const { user } = useContext(UserContext)
	const user_id = user?.user_id

	// Разделяем стейты
	const [tasksDailyTimes, setTasksDailyTimes] = useState([]) // ISO массив
	const [tasksSpecificTimes, setTasksSpecificTimes] = useState([]) // (Если решите редактировать)
	const [scheduleDailyTimes, setScheduleDailyTimes] = useState([])
	const [scheduleSpecificTimes, setScheduleSpecificTimes] = useState([])
	const [scheduleBeforeDue, setScheduleBeforeDue] = useState('5') // строка для input

	const [isTimePickerVisible, setTimePickerVisible] = useState(false)

	useEffect(() => {
		if (!user_id) return
		loadAllSettings()
	}, [user_id])

	const loadAllSettings = async () => {
		try {
			const data = await loadNotificationSettings(user_id)
			// data = { tasksDaily, tasksSpecific, scheduleDaily, scheduleSpecific, scheduleBeforeDue }
			setTasksDailyTimes(data.tasksDaily || [])
			setTasksSpecificTimes(data.tasksSpecific || [])
			setScheduleDailyTimes(data.scheduleDaily || [])
			setScheduleSpecificTimes(data.scheduleSpecific || [])
			setScheduleBeforeDue(String(data.scheduleBeforeDue ?? '5'))
		} catch (err) {
			Alert.alert('Ошибка', 'Не удалось загрузить настройки уведомлений.')
			console.error(err)
		}
	}

	/**
	 * Пример: хотим редактировать "daily для задач" (tasksDailyTimes).
	 * Если вы хотите ещё и править "specific_time для задач",
	 * придётся сделать похожие функции/кнопки, либо объединить в UI.
	 */
	const handleAddDailyTaskTime = date => {
		const isoString = date.toISOString()
		if (!tasksDailyTimes.includes(isoString)) {
			const updated = [...tasksDailyTimes, isoString]
			setTasksDailyTimes(updated)
		} else {
			Alert.alert('Внимание', 'Это время уже добавлено.')
		}
	}

	const removeDailyTaskTime = isoValue => {
		setTasksDailyTimes(prev => prev.filter(t => t !== isoValue))
	}

	const handleSaveDailyTasks = async () => {
		try {
			await saveTaskTimes(user_id, tasksDailyTimes)
			Alert.alert(
				'Успешно',
				'Времена уведомлений (daily) для задач сохранены.'
			)
		} catch (error) {
			Alert.alert('Ошибка', 'Не удалось сохранить времена уведомлений.')
			console.error(error)
		}
	}

	const handleSaveScheduleOffset = async () => {
		const offset = parseInt(scheduleBeforeDue, 10)
		if (isNaN(offset) || offset < 0) {
			Alert.alert('Ошибка', 'Некорректное число минут.')
			return
		}
		try {
			// Предположим, вы уже адаптировали saveEventOffset на бэке,
			// чтобы принимать { user_id, offset }
			// или { user_id, times: [{ offsetMs: offset*60000 }] }
			await saveEventOffset(user_id, offset)
			Alert.alert('Успешно', 'Напоминание (offset) сохранено.')
		} catch (error) {
			Alert.alert('Ошибка', 'Не удалось сохранить offset.')
			console.error(error)
		}
	}

	const [currentPickerMode, setCurrentPickerMode] = useState(null)

	const openTimePickerForDailyTasks = () => {
		setCurrentPickerMode('tasksDaily')
		setTimePickerVisible(true)
	}

	const handleConfirmTime = date => {
		// Определяем, для какого типа мы открывали пикер
		if (currentPickerMode === 'tasksDaily') {
			handleAddDailyTaskTime(date)
		}
		// ... если хотите ещё scheduleDaily, tasksSpecific, и т.д. - аналогично
		setTimePickerVisible(false)
	}

	return (
		<Container>
			<ScrollView>
				{/* БЛОК #1: Задачи (daily) */}
				<Section>
					<SectionTitle>Уведомления для задач (Daily)</SectionTitle>
					{tasksDailyTimes.map((isoVal, idx) => (
						<TimeItem key={idx}>
							<TimeText>{formatISOToTime(isoVal)}</TimeText>
							<RemoveButton
								onPress={() => removeDailyTaskTime(isoVal)}
							>
								<RemoveButtonText>Удалить</RemoveButtonText>
							</RemoveButton>
						</TimeItem>
					))}
					<AddTimeButton onPress={openTimePickerForDailyTasks}>
						<AddTimeButtonText>Добавить время</AddTimeButtonText>
					</AddTimeButton>
					<SaveButton onPress={handleSaveDailyTasks}>
						<SaveButtonText>Сохранить</SaveButtonText>
					</SaveButton>
				</Section>

				{/* БЛОК #2: События (offset=before_due) */}
				<Section>
					<SectionTitle>
						Уведомления для событий (Offset)
					</SectionTitle>
					<SectionDescription>
						За сколько минут до начала события присылать
						уведомление?
					</SectionDescription>
					<Input
						value={scheduleBeforeDue}
						onChangeText={setScheduleBeforeDue}
						keyboardType="numeric"
					/>
					<SaveButton onPress={handleSaveScheduleOffset}>
						<SaveButtonText>Сохранить</SaveButtonText>
					</SaveButton>
				</Section>

				{/* БЛОК #3: Задачи (specific_time) - если хотите */}
				<Section>
					<SectionTitle>
						Уведомления: Задачи (Specific Time)
					</SectionTitle>
					{tasksSpecificTimes.map((isoVal, idx) => (
						<TimeItem key={idx}>
							<TimeText>{formatISOToTime(isoVal)}</TimeText>
							{/* remove etc. */}
						</TimeItem>
					))}
					{/* Если хотите кнопку "добавить specific_time" */}
				</Section>

				{/* БЛОК #4: События (daily) */}
				<Section>
					<SectionTitle>События (Daily)</SectionTitle>
					{scheduleDailyTimes.map((isoVal, idx) => (
						<TimeItem key={idx}>
							<TimeText>{formatISOToTime(isoVal)}</TimeText>
							{/* remove etc. */}
						</TimeItem>
					))}
				</Section>

				{/* БЛОК #5: События (specific_time) */}
				<Section>
					<SectionTitle>События (Specific Time)</SectionTitle>
					{scheduleSpecificTimes.map((isoVal, idx) => (
						<TimeItem key={idx}>
							<TimeText>{formatISOToTime(isoVal)}</TimeText>
							{/* remove etc. */}
						</TimeItem>
					))}
				</Section>
			</ScrollView>

			<DateTimePickerModal
				isVisible={isTimePickerVisible}
				mode="time"
				onConfirm={handleConfirmTime}
				onCancel={() => setTimePickerVisible(false)}
			/>
		</Container>
	)
}

// ... стили не меняются ...

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
