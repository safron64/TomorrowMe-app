import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components/native'
import { FlatList } from 'react-native'
import { UserContext } from '../context/UserContext'
import {
	fetchHabits,
	createHabit,
	updateHabit,
	deleteHabit,
} from '../api/habits'
import withSafeScreen from '../HOC/withSafeScreen'

const HabitsScreen = () => {
	const { user } = useContext(UserContext)
	const user_id = user ? user.user_id : null

	const [habits, setHabits] = useState([])
	const [habitDescription, setHabitDescription] = useState('')
	const [loading, setLoading] = useState(false)
	const [editingHabitId, setEditingHabitId] = useState(null)
	const [editingDescription, setEditingDescription] = useState('')

	useEffect(() => {
		if (user_id) loadHabits()
	}, [user_id])

	const loadHabits = async () => {
		setLoading(true)
		const habitsData = await fetchHabits(user_id)
		setHabits(habitsData)
		setLoading(false)
	}

	const handleCreateHabit = async () => {
		if (await createHabit(user_id, habitDescription)) {
			setHabitDescription('')
			loadHabits()
		}
	}

	const handleUpdateHabit = async habit_id => {
		if (await updateHabit(user_id, habit_id, editingDescription)) {
			setEditingHabitId(null)
			setEditingDescription('')
			loadHabits()
		}
	}

	const handleDeleteHabit = async habit_id => {
		if (await deleteHabit(user_id, habit_id)) {
			loadHabits()
		}
	}

	const startEditing = (habit_id, currentDescription) => {
		setEditingHabitId(habit_id)
		setEditingDescription(currentDescription)
	}

	const cancelEditing = () => {
		setEditingHabitId(null)
		setEditingDescription('')
	}

	const renderHabitItem = ({ item }) => {
		const isEditing = item.habit_id === editingHabitId

		return (
			<HabitItem>
				{isEditing ? (
					<>
						<EditInput
							value={editingDescription}
							onChangeText={setEditingDescription}
							placeholder="Новое описание привычки"
							placeholderTextColor="#888"
						/>
						<ButtonRow>
							<SmallButton
								onPress={() => handleUpdateHabit(item.habit_id)}
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
								onPress={() => handleDeleteHabit(item.habit_id)}
							>
								<SmallButtonText>Удалить</SmallButtonText>
							</SmallButtonDelete>
						</ButtonRow>
					</>
				)}
			</HabitItem>
		)
	}

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
			<Button onPress={handleCreateHabit} disabled={loading}>
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

export default  withSafeScreen(HabitsScreen)

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
