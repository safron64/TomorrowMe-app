import React, { useEffect, useState, useContext, useCallback } from 'react'
import {
	FlatList,
	TouchableOpacity,
	Alert,
	Modal,
	ActivityIndicator,
} from 'react-native'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import { API_BASE_URL } from '@env'
import { UserContext } from '../context/UserContext'
import { useFocusEffect } from '@react-navigation/native'

const TodoScreen = () => {
	const [tasks, setTasks] = useState([])
	const [inputText, setInputText] = useState('')
	const [isEditing, setIsEditing] = useState(false)
	const [taskToEdit, setTaskToEdit] = useState(null)
	const [editText, setEditText] = useState('')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	const { user } = useContext(UserContext)
	const user_id = user ? user.user_id : null

	useFocusEffect(
		useCallback(() => {
			const loadData = async () => {
				await fetchTasks()
				const { taskTimes } = await loadNotificationSettings()
				await scheduleDailyTaskNotifications(taskTimes)
			}
			loadData()
		}, [user_id])
	)
	const fetchTasks = async () => {
		try {
			setLoading(true)
			setError(null)

			const response = await axios.get(`${API_BASE_URL}/tasks`, {
				params: {
					user_id: user_id,
				},
			})

			setTasks(response.data)
		} catch (error) {
			console.error('Error fetching tasks:', error)
			setError('Ошибка при загрузке задач.')
		} finally {
			setLoading(false)
		}
	}

	const addTask = async () => {
		if (inputText.trim() === '') {
			Alert.alert('Ошибка', 'Введите текст задачи')
			return
		}
		try {
			const newTask = {
				task_description: inputText,
			}

			const response = await axios.post(
				`${API_BASE_URL}/tasks`,
				newTask,
				{
					params: {
						user_id: user_id,
					},
				}
			)

			setTasks([response.data, ...tasks])
			setInputText('')
		} catch (error) {
			console.error('Error adding task:', error)
			Alert.alert('Ошибка', 'Не удалось добавить задачу.')
		}
	}

	const updateTask = async (taskId, newText) => {
		try {
			const updatedTask = {
				task_description: newText,
			}

			const response = await axios.put(
				`${API_BASE_URL}/tasks/${taskId}`,
				updatedTask,
				{
					params: {
						user_id,
					},
				}
			)

			setTasks(prevTasks =>
				prevTasks.map(task =>
					task.task_id === taskId ? response.data : task
				)
			)
		} catch (error) {
			console.error('Error updating task:', error)
			Alert.alert('Ошибка', 'Не удалось обновить задачу.')
		}
	}

	const deleteTask = async taskId => {
		try {
			await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
				params: {
					user_id: user_id,
				},
			})

			setTasks(prevTasks =>
				prevTasks.filter(task => task.task_id !== taskId)
			)
		} catch (error) {
			console.error('Error deleting task:', error)
			Alert.alert('Ошибка', 'Не удалось удалить задачу.')
		}
	}

	const toggleTaskCompletion = async taskId => {
		const task = tasks.find(task => task.task_id === taskId)
		if (!task) return

		try {
			const updatedTask = {
				is_completed: !task.is_completed,
			}

			const response = await axios.put(
				`${API_BASE_URL}/tasks/${taskId}`,
				updatedTask,
				{
					params: {
						user_id: user_id,
					},
				}
			)

			setTasks(prevTasks =>
				prevTasks.map(t => (t.task_id === taskId ? response.data : t))
			)
		} catch (error) {
			console.error('Error toggling task completion:', error)
			Alert.alert('Ошибка', 'Не удалось обновить статус задачи.')
		}
	}

	const editTask = task => {
		setTaskToEdit(task)
		setEditText(task.task_description)
		setIsEditing(true)
	}

	const saveEdit = () => {
		if (editText.trim() === '') {
			Alert.alert('Ошибка', 'Текст задачи не может быть пустым')
			return
		}
		updateTask(taskToEdit.task_id, editText)
		setIsEditing(false)
		setTaskToEdit(null)
		setEditText('')
	}

	const renderTask = ({ item }) => (
		<TaskContainer>
			<TouchableOpacity
				onPress={() => toggleTaskCompletion(item.task_id)}
			>
				<Ionicons
					name={
						item.is_completed
							? 'checkmark-circle'
							: 'ellipse-outline'
					}
					size={24}
					color="#0A84FF"
				/>
			</TouchableOpacity>
			<TaskText completed={item.is_completed}>
				{/* Здесь выводим task_number */}
				{item.task_number}. {item.task_description}
			</TaskText>
			<TaskActions>
				<ActionButton onPress={() => editTask(item)}>
					<Ionicons name="pencil" size={24} color="#0A84FF" />
				</ActionButton>
				<ActionButton onPress={() => deleteTask(item.task_id)}>
					<Ionicons name="trash-bin" size={24} color="#0A84FF" />
				</ActionButton>
			</TaskActions>
		</TaskContainer>
	)

	if (loading) {
		return (
			<Container>
				<ActivityIndicator size="large" color="#0A84FF" />
			</Container>
		)
	}

	if (error) {
		return (
			<Container>
				<ErrorText>{error}</ErrorText>
			</Container>
		)
	}

	return (
		<Container>
			<Header>
				<Title>Список дел</Title>
			</Header>
			<InputContainer>
				<Input
					placeholder="Новая задача"
					placeholderTextColor="#888"
					value={inputText}
					onChangeText={setInputText}
				/>
				<AddButton onPress={addTask}>
					<AddButtonText>Добавить</AddButtonText>
				</AddButton>
			</InputContainer>
			<TasksList
				data={tasks}
				keyExtractor={item => item.task_id.toString()}
				renderItem={renderTask}
			/>

			{/* Модальное окно для редактирования задачи */}
			<Modal visible={isEditing} transparent animationType="fade">
				<ModalContainer>
					<ModalContent>
						<ModalTitle>Редактировать задачу</ModalTitle>
						<ModalInput
							value={editText}
							onChangeText={setEditText}
							placeholder="Текст задачи"
							placeholderTextColor="#888"
						/>
						<ModalButtons>
							<ModalButton onPress={() => setIsEditing(false)}>
								<ModalButtonText>Отмена</ModalButtonText>
							</ModalButton>
							<ModalButton onPress={saveEdit}>
								<ModalButtonText>Сохранить</ModalButtonText>
							</ModalButton>
						</ModalButtons>
					</ModalContent>
				</ModalContainer>
			</Modal>
		</Container>
	)
}

export default TodoScreen

// Стили
const Container = styled.View`
	flex: 1;
	background-color: #000;
	padding: 10px;
	padding-top: 50px;
`

const Header = styled.View`
	margin-bottom: 20px;
`

const Title = styled.Text`
	color: #fff;
	font-size: 32px;
	font-weight: bold;
	text-align: center;
`

const InputContainer = styled.View`
	flex-direction: row;
	margin-bottom: 20px;
`

const Input = styled.TextInput`
	flex: 1;
	border: 1px solid #444;
	border-radius: 5px;
	padding: 10px;
	color: #fff;
`

const AddButton = styled.TouchableOpacity`
	background-color: #0a84ff;
	padding: 10px 15px;
	margin-left: 10px;
	border-radius: 5px;
	justify-content: center;
	align-items: center;
`

const AddButtonText = styled.Text`
	color: #fff;
	font-weight: bold;
`

const TasksList = styled.FlatList`
	flex: 1;
`

const TaskContainer = styled.View`
	background-color: #1c1c1e;
	padding: 15px;
	border-radius: 5px;
	flex-direction: row;
	align-items: center;
	margin-bottom: 10px;
`

const TaskText = styled.Text`
	color: ${props => (props.completed ? '#666' : '#fff')};
	text-decoration: ${props => (props.completed ? 'line-through' : 'none')};
	flex: 1;
	margin-left: 10px;
`

const TaskActions = styled.View`
	flex-direction: row;
`

const ActionButton = styled.TouchableOpacity`
	margin-left: 15px;
`

// Стили для модального окна
const ModalContainer = styled.View`
	flex: 1;
	background-color: rgba(0, 0, 0, 0.7);
	justify-content: center;
	align-items: center;
`

const ModalContent = styled.View`
	background-color: #1c1c1e;
	padding: 20px;
	border-radius: 10px;
	width: 80%;
`

const ModalTitle = styled.Text`
	color: #fff;
	font-size: 20px;
	font-weight: bold;
	margin-bottom: 15px;
`

const ModalInput = styled.TextInput`
	border: 1px solid #444;
	border-radius: 5px;
	padding: 10px;
	color: #fff;
	margin-bottom: 20px;
`

const ModalButtons = styled.View`
	flex-direction: row;
	justify-content: flex-end;
`

const ModalButton = styled.TouchableOpacity`
	margin-left: 15px;
`

const ModalButtonText = styled.Text`
	color: #0a84ff;
	font-weight: bold;
	font-size: 16px;
`
