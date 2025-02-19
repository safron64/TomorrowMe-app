import axios from 'axios'
import { API_BASE_URL } from '@env'

export const fetchHabits = async user_id => {
	if (!user_id) return []

	try {
		const response = await axios.get(`${API_BASE_URL}/habits`, {
			params: { user_id },
		})
		return response.data
	} catch (error) {
		console.error('Ошибка при получении привычек:', error.message)
		return []
	}
}

export const createHabit = async (user_id, habitDescription) => {
	if (!habitDescription) {
		alert('Введите описание привычки')
		return
	}

	try {
		await axios.post(
			`${API_BASE_URL}/habits`,
			{ habit_description: habitDescription },
			{ params: { user_id } }
		)
		return true
	} catch (error) {
		console.error('Ошибка при создании привычки:', error.message)
		return false
	}
}

export const updateHabit = async (user_id, habit_id, habit_description) => {
	try {
		await axios.put(
			`${API_BASE_URL}/habits/${habit_id}`,
			{ habit_description },
			{ params: { user_id } }
		)
		return true
	} catch (error) {
		console.error('Ошибка при обновлении привычки:', error.message)
		return false
	}
}

export const deleteHabit = async (user_id, habit_id) => {
	try {
		await axios.delete(`${API_BASE_URL}/habits/${habit_id}`, {
			params: { user_id },
		})
		return true
	} catch (error) {
		console.error('Ошибка при удалении привычки:', error.message)
		return false
	}
}
