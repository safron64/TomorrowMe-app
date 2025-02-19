import React, { useEffect, useState } from 'react'
import { Modal, FlatList, Alert } from 'react-native'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'
import {
	loadNotificationSettings,
	saveTimesNotification,
} from '../../services/notifications'

// Импортируем ваши функции

export default function NotificationModal({
	visible,
	userId,
	habitDescription,
	onClose,
}) {
	// Локальное состояние
	const [times, setTimes] = useState([]) // Уже сохранённые/добавленные времена
	const [newTime, setNewTime] = useState('') // Временное поле для ввода времени

	// При открытии модалки (visible = true) — загружаем существующие настройки
	useEffect(() => {
		console.log(userId)
		if (!visible) return
		if (!userId) return

		const fetchSettings = async () => {
			try {
				const data = await loadNotificationSettings(userId)
				// Допустим, бэк возвращает что-то вроде: { tasks: ["09:00", "12:30"] }
				// Или в другой структуре, главное вытащить именно массив времен
				if (data?.tasksDaily) {
					setTimes(data.tasksDaily)
				} else {
					setTimes([])
				}
			} catch (error) {
				console.log('Ошибка загрузки настроек уведомлений:', error)
				setTimes([])
			}
		}

		fetchSettings()
	}, [visible, userId])

	// Обработчик добавления нового времени
	const handleAddTime = () => {
		// Минимальная валидация формата (HH:MM)
		// Можно написать более строгую проверку: через регэксп, проверку 00-23/00-59 и т.п.
		if (!newTime.match(/^\d{2}:\d{2}$/)) {
			Alert.alert('Ошибка', 'Введите время в формате HH:MM')
			return
		}

		// Добавляем и очищаем поле
		setTimes(prev => [...prev, newTime])
		setNewTime('')
	}

	// Обработчик удаления конкретного времени
	const handleRemoveTime = index => {
		setTimes(prev => prev.filter((_, i) => i !== index))
	}

	// Сохранить на сервере
	const handleSave = async () => {
		try {
			await saveTimesNotification(userId, times, 'habit')
			Alert.alert('Успешно', 'Времена уведомлений сохранены!')
			onClose() // Закрываем модалку
		} catch (error) {
			Alert.alert('Ошибка', 'Не удалось сохранить времена уведомлений.')
			console.log(error)
		}
	}

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<ModalOverlay>
				<ModalContent>
					<ModalTitle>Уведомления</ModalTitle>
					<ModalDesc>
						Настройки для привычки: {habitDescription}
					</ModalDesc>

					{/* Поле для ввода времени */}
					<Row>
						<TimeInput
							value={newTime}
							onChangeText={setNewTime}
							placeholder="HH:MM"
							placeholderTextColor="#888"
						/>
						<AddButton onPress={handleAddTime}>
							<Ionicons name="add" size={24} color="#fff" />
						</AddButton>
					</Row>

					{/* Список уже добавленных времен */}
					<TimesList
						data={times}
						keyExtractor={(_, index) => index.toString()}
						renderItem={({ item, index }) => (
							<TimeItem>
								<TimeItemText>{item}</TimeItemText>
								<RemoveButton
									onPress={() => handleRemoveTime(index)}
								>
									<Ionicons
										name="trash"
										size={18}
										color="#ff3b30"
									/>
								</RemoveButton>
							</TimeItem>
						)}
					/>

					{/* Кнопки Сохранить/Закрыть */}
					<SaveButton onPress={handleSave}>
						<SaveButtonText>Сохранить</SaveButtonText>
					</SaveButton>
					<CloseButton onPress={onClose}>
						<CloseButtonText>Закрыть</CloseButtonText>
					</CloseButton>
				</ModalContent>
			</ModalOverlay>
		</Modal>
	)
}

const ModalOverlay = styled.View`
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

const ModalTitle = styled.Text`
	color: #fff;
	font-size: 20px;
	font-weight: bold;
	margin-bottom: 15px;
`

const ModalDesc = styled.Text`
	color: #fff;
	font-size: 16px;
	margin-bottom: 20px;
`

const Row = styled.View`
	flex-direction: row;
	align-items: center;
	margin-bottom: 10px;
`

const TimeInput = styled.TextInput`
	flex: 1;
	border: 1px solid #444;
	border-radius: 5px;
	padding: 10px;
	color: #fff;
`

const AddButton = styled.TouchableOpacity`
	background-color: #0a84ff;
	margin-left: 10px;
	padding: 10px;
	border-radius: 5px;
`

const TimesList = styled(FlatList)`
	max-height: 150px;
	margin-bottom: 20px;
`

const TimeItem = styled.View`
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	background-color: #2c2c2e;
	padding: 10px;
	border-radius: 5px;
	margin-bottom: 5px;
`

const TimeItemText = styled.Text`
	color: #fff;
`

const RemoveButton = styled.TouchableOpacity`
	padding: 5px;
`

const SaveButton = styled.TouchableOpacity`
	background-color: #0a84ff;
	padding: 15px;
	border-radius: 5px;
	align-items: center;
	margin-bottom: 10px;
`

const SaveButtonText = styled.Text`
	color: #fff;
	font-weight: bold;
	font-size: 18px;
`

const CloseButton = styled.TouchableOpacity`
	padding: 15px;
	border-radius: 5px;
	align-items: center;
	background-color: #333;
`

const CloseButtonText = styled.Text`
	color: #fff;
	font-size: 16px;
`
