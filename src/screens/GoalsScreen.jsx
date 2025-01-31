import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components/native'
import { FlatList, Text, TouchableOpacity } from 'react-native'
import axios from 'axios'
import { UserContext } from '../context/UserContext'

import { API_BASE_URL } from '@env'

const GoalsScreen = () => {
	const { user } = useContext(UserContext)
	const user_id = user ? user.user_id : null

	const [goals, setGoals] = useState([])
	const [goalDescription, setGoalDescription] = useState('')
	const [loading, setLoading] = useState(false)

	// Для режима редактирования
	const [editingGoalId, setEditingGoalId] = useState(null)
	const [editingDescription, setEditingDescription] = useState('')

	useEffect(() => {
		if (user_id) {
			fetchGoals()
		}
	}, [user_id])

	// Получение списка целей (GET /goals?user_id=...)
	const fetchGoals = async () => {
		if (!user_id) return
		try {
			setLoading(true)
			const response = await axios.get(`${API_BASE_URL}/goals`, {
				params: { user_id },
			})
			setGoals(response.data)
		} catch (error) {
			console.error('Ошибка при получении целей:', error.message)
		} finally {
			setLoading(false)
		}
	}

	// Создание новой цели (POST /goals?user_id=...)
	const createGoal = async () => {
		if (!goalDescription) {
			alert('Введите описание цели')
			return
		}
		try {
			setLoading(true)
			await axios.post(
				`${API_BASE_URL}/goals`,
				{
					goal_description: goalDescription,
				},
				{
					params: { user_id },
				}
			)
			// Обновим список после создания
			setGoalDescription('')
			fetchGoals()
		} catch (error) {
			console.error('Ошибка при создании цели:', error.message)
		} finally {
			setLoading(false)
		}
	}

	// Начать редактирование: запоминаем goal_id и текущее описание
	const startEditing = (goal_id, currentDescription) => {
		setEditingGoalId(goal_id)
		setEditingDescription(currentDescription)
	}

	// Сохранить изменения (PUT /goals/:goal_id?user_id=...)
	const saveEditing = async goal_id => {
		try {
			setLoading(true)
			await axios.put(
				`${API_BASE_URL}/goals/${goal_id}`,
				{
					goal_description: editingDescription,
				},
				{
					params: { user_id },
				}
			)
			fetchGoals()
		} catch (error) {
			console.error('Ошибка при обновлении цели:', error.message)
		} finally {
			// Выходим из режима редактирования
			setEditingGoalId(null)
			setEditingDescription('')
			setLoading(false)
		}
	}

	// Отмена редактирования
	const cancelEditing = () => {
		setEditingGoalId(null)
		setEditingDescription('')
	}

	// Пометить цель как выполненную (is_completed = true)
	const markGoalAsCompleted = async goal_id => {
		try {
			setLoading(true)
			await axios.put(
				`${API_BASE_URL}/goals/${goal_id}`,
				{ is_completed: true },
				{ params: { user_id } }
			)
			fetchGoals()
		} catch (error) {
			console.error('Ошибка при отметке цели выполненной:', error.message)
		} finally {
			setLoading(false)
		}
	}

	// Удаление цели (DELETE /goals/:goal_id?user_id=...)
	const deleteGoal = async goal_id => {
		try {
			setLoading(true)
			await axios.delete(`${API_BASE_URL}/goals/${goal_id}`, {
				params: { user_id },
			})
			fetchGoals()
		} catch (error) {
			console.error('Ошибка при удалении цели:', error.message)
		} finally {
			setLoading(false)
		}
	}

	const renderGoalItem = ({ item }) => {
		const isEditing = item.goal_id === editingGoalId

		return (
			<GoalItem>
				{isEditing ? (
					// Если цель в режиме редактирования
					<>
						<EditInput
							placeholder="Новое описание"
							placeholderTextColor="#888"
							value={editingDescription}
							onChangeText={setEditingDescription}
						/>
						<ButtonRow>
							<SmallButton
								onPress={() => saveEditing(item.goal_id)}
							>
								<SmallButtonText>Сохранить</SmallButtonText>
							</SmallButton>
							<SmallButton onPress={cancelEditing}>
								<SmallButtonText>Отмена</SmallButtonText>
							</SmallButton>
						</ButtonRow>
					</>
				) : (
					// Обычный режим просмотра
					<>
						<GoalText>
							{item.goal_number}. {item.goal_description}{' '}
							{item.is_completed ? '(Выполнена)' : ''}
						</GoalText>
						<ButtonRow>
							{!item.is_completed && (
								<SmallButton
									onPress={() =>
										markGoalAsCompleted(item.goal_id)
									}
								>
									<SmallButtonText>Выполнить</SmallButtonText>
								</SmallButton>
							)}
							<SmallButton
								onPress={() =>
									startEditing(
										item.goal_id,
										item.goal_description
									)
								}
							>
								<SmallButtonText>Ред.</SmallButtonText>
							</SmallButton>
							<SmallButtonDelete
								onPress={() => deleteGoal(item.goal_id)}
							>
								<SmallButtonText>Удалить</SmallButtonText>
							</SmallButtonDelete>
						</ButtonRow>
					</>
				)}
			</GoalItem>
		)
	}

	// Если user_id отсутствует
	if (!user_id) {
		return (
			<Container>
				<Title>Нет пользователя</Title>
			</Container>
		)
	}

	return (
		<Container>
			<Title>Мои цели</Title>

			<Input
				placeholder="Описание новой цели"
				placeholderTextColor="#888"
				value={goalDescription}
				onChangeText={setGoalDescription}
			/>

			<Button onPress={createGoal} disabled={loading}>
				<ButtonText>
					{loading ? 'Загрузка...' : 'Создать цель'}
				</ButtonText>
			</Button>

			<FlatList
				data={goals}
				keyExtractor={item => item.goal_id.toString()}
				renderItem={renderGoalItem}
				style={{ width: '100%', marginTop: 20 }}
			/>
		</Container>
	)
}

export default GoalsScreen

/* ------ СТИЛИ ------ */
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

const GoalItem = styled.View`
	background-color: #2c2c2c;
	padding: 10px;
	margin-bottom: 10px;
	border-radius: 5px;
`

const GoalText = styled.Text`
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
	justify-content: space-between;
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
