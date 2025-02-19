import axios from 'axios'
import { API_BASE_URL } from '@env'

export const fetchSchedules = async user_id => {
	if (!user_id) return []

	try {
		const response = await axios.get(`${API_BASE_URL}/schedules`, {
			params: { user_id },
		})
		return response.data
	} catch (error) {
		console.error('Ошибка при загрузке расписания:', error.message)
		return []
	}
}

export const createSchedule = async (user_id, activity, date, time_frame) => {
	try {
		await axios.post(
			`${API_BASE_URL}/schedules`,
			{ activity, date, time_frame },
			{ params: { user_id } }
		)
		return true
	} catch (error) {
		console.error('Ошибка при создании события:', error.message)
		return false
	}
}

export const updateSchedule = async (
	user_id,
	schedule_id,
	activity,
	date,
	time_frame
) => {
	try {
		await axios.put(
			`${API_BASE_URL}/schedules/${schedule_id}`,
			{ activity, date, time_frame },
			{ params: { user_id } }
		)
		return true
	} catch (error) {
		console.error('Ошибка при обновлении события:', error.message)
		return false
	}
}

export const deleteSchedule = async (user_id, schedule_id) => {
	try {
		await axios.delete(`${API_BASE_URL}/schedules/${schedule_id}`, {
			params: { user_id },
		})
		return true
	} catch (error) {
		console.error('Ошибка при удалении события:', error.message)
		return false
	}
}
