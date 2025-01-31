import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components/native'
import { FlatList } from 'react-native'
import axios from 'axios'
import { UserContext } from '../context/UserContext' // путь к вашему контексту

import { API_BASE_URL } from '@env'

const HabitsScreen = () => {
	const { user } = useContext(UserContext)
	const user_id = user ? user.user_id : null

	const [habits, setHabits] = useState([])
	const [habitDescription, setHabitDescription] = useState('')
	const [loading, setLoading] = useState(false)

	// Состояния для редактирования
	const [editingHabitId, setEditingHabitId] = useState(null)
	const [editingDescription, setEditingDescription] = useState('')

	useEffect(() => {
		if (user_id) {
			fetchHabits()
		}
	}, [user_id])

	// Получить привычки (GET /habits?user_id=...)
	const fetchHabits = async () => {
		try {
			setLoading(true)
			const response = await axios.get(`${API_BASE_URL}/habits`, {
				params: { user_id },
			})
			setHabits(response.data)
		} catch (error) {
			console.error('Ошибка при получении привычек:', error.message)
		} finally {
			setLoading(false)
		}
	}

	// Создать привычку (POST /habits?user_id=...)
	// habit_number генерируется автоматически на бэкенде
	const createHabit = async () => {
		if (!habitDescription) {
			alert('Введите описание привычки')
			return
		}
		try {
			setLoading(true)
			await axios.post(
				`${API_BASE_URL}/habits`,
				{
					// Тело запроса. habit_description - обязательное поле
					habit_description: habitDescription,
				},
				{ params: { user_id } }
			)
			setHabitDescription('') // сбрасываем поле
			fetchHabits()
		} catch (error) {
			console.error('Ошибка при создании привычки:', error.message)
		} finally {
			setLoading(false)
		}
	}

	// Начать редактирование (включить режим редактирования)
	// сохраняем id привычки и её текущее описание
	const startEditing = (habit_id, currentDescription) => {
		setEditingHabitId(habit_id)
		setEditingDescription(currentDescription)
	}

	// Сохранить отредактированную привычку (PUT /habits/:habit_id?user_id=...)
	const saveEditing = async habit_id => {
		try {
			setLoading(true)
			await axios.put(
				`${API_BASE_URL}/habits/${habit_id}`,
				{ habit_description: editingDescription },
				{ params: { user_id } }
			)
			// Успешно обновили - перезагружаем список и убираем режим редактирования
			fetchHabits()
		} catch (error) {
			console.error('Ошибка при обновлении привычки:', error.message)
		} finally {
			// Выходим из режима редактирования
			setEditingHabitId(null)
			setEditingDescription('')
			setLoading(false)
		}
	}

	// Отмена редактирования
	const cancelEditing = () => {
		setEditingHabitId(null)
		setEditingDescription('')
	}

	// Удалить привычку (DELETE /habits/:habit_id?user_id=...)
	const deleteHabit = async habit_id => {
		try {
			setLoading(true)
			await axios.delete(`${API_BASE_URL}/habits/${habit_id}`, {
				params: { user_id },
			})
			fetchHabits()
		} catch (error) {
			console.error('Ошибка при удалении привычки:', error.message)
		} finally {
			setLoading(false)
		}
	}

	// Рендер одного элемента списка привычек
	const renderHabitItem = ({ item }) => {
		// Если эта привычка в режиме редактирования
		const isEditing = item.habit_id === editingHabitId

		return (
			<HabitItem>
				{isEditing ? (
					<>
						{/* При редактировании отображаем поле для редактирования описания */}
						<EditInput
							value={editingDescription}
							onChangeText={setEditingDescription}
							placeholder="Новое описание привычки"
							placeholderTextColor="#888"
						/>
						<ButtonRow>
							<SmallButton
								onPress={() => saveEditing(item.habit_id)}
							>
								<SmallButtonText>Сохранить</SmallButtonText>
							</SmallButton>
							<SmallButton onPress={cancelEditing}>
								<SmallButtonText>Отмена</SmallButtonText>
							</SmallButton>
						</ButtonRow>
					</>
				) : (
					<>
						{/* В обычном режиме отображаем текущее описание */}
						<HabitText>
							{item.habit_number}. {item.habit_description}{' '}
							{!item.is_active && '(Неактивна)'}
						</HabitText>
						<ButtonRow>
							<SmallButton
								onPress={() =>
									startEditing(
										item.habit_id,
										item.habit_description
									)
								}
							>
								<SmallButtonText>Ред.</SmallButtonText>
							</SmallButton>
							<SmallButtonDelete
								onPress={() => deleteHabit(item.habit_id)}
							>
								<SmallButtonText>Удалить</SmallButtonText>
							</SmallButtonDelete>
						</ButtonRow>
					</>
				)}
			</HabitItem>
		)
	}

	// Если user_id отсутствует (пользователь не залогинен и т.п.)
	if (!user_id) {
		return (
			<Container>
				<Title>Нет пользователя</Title>
			</Container>
		)
	}

	return (
		<Container>
			<Title>Мои привычки</Title>

			<Input
				placeholder="Описание новой привычки"
				placeholderTextColor="#888"
				value={habitDescription}
				onChangeText={setHabitDescription}
			/>

			<Button onPress={createHabit} disabled={loading}>
				<ButtonText>
					{loading ? 'Загрузка...' : 'Создать привычку'}
				</ButtonText>
			</Button>

			<FlatList
				data={habits}
				keyExtractor={item => item.habit_id.toString()}
				renderItem={renderHabitItem}
				style={{ width: '100%', marginTop: 20 }}
			/>
		</Container>
	)
}

export default HabitsScreen

/* -------- СТИЛИ -------- */
const Container = styled.View`
	flex: 1;
	background-color: #000;
	padding: 20px;
`

const Title = styled.Text`
	color: #fff;
	font-size: 24px;
	margin-bottom: 10px;
	text-align: center;
`

const Input = styled.TextInput`
	background-color: #1e1e1e;
	color: #fff;
	padding: 10px;
	margin-bottom: 10px;
	border-radius: 5px;
`

const Button = styled.TouchableOpacity`
	background-color: #4caf50;
	padding: 12px;
	align-items: center;
	border-radius: 5px;
	margin-bottom: 10px;
`

const ButtonText = styled.Text`
	color: #fff;
	font-size: 16px;
`

const HabitItem = styled.View`
	background-color: #2c2c2c;
	padding: 10px;
	margin-bottom: 10px;
	border-radius: 5px;
`

const HabitText = styled.Text`
	color: #fff;
	font-size: 16px;
`

const EditInput = styled.TextInput`
	background-color: #1e1e1e;
	color: #fff;
	padding: 8px;
	border-radius: 5px;
	margin-bottom: 8px;
`

const ButtonRow = styled.View`
	flex-direction: row;
	justify-content: space-evenly;
	margin-top: 8px;
`

const SmallButton = styled.TouchableOpacity`
	background-color: #0066cc;
	padding: 8px;
	border-radius: 5px;
	margin-right: 8px;
`

const SmallButtonDelete = styled.TouchableOpacity`
	background-color: #cc0000;
	padding: 8px;
	border-radius: 5px;
`

const SmallButtonText = styled.Text`
	color: #fff;
	font-size: 14px;
`
