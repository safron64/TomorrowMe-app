import React, { useContext, useEffect, useState } from 'react'
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native'

import { API_BASE_URL } from '@env'
import { UserContext } from '../context/UserContext'
import * as Notifications from 'expo-notifications'

export default function NotificationForm() {
	useEffect(() => {
		const subscription =
			Notifications.addNotificationResponseReceivedListener(response => {
				console.log('Пользователь кликнул уведомление:', response)
				const settingId =
					response.notification.request.content.data?.setting_id
				if (settingId) {
					stopNotificationOnBackend(settingId)
				}
			})

		return () => {
			subscription.remove()
		}
	}, [])

	async function stopNotificationOnBackend(settingId) {
		try {
			const response = await fetch(`${API_BASE_URL}/notifications/stop`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ setting_id: settingId }),
			})

			if (!response.ok) {
				const errData = await response.json()
				throw new Error(errData.error || 'Failed to stop notification')
			}
			console.log('Уведомление успешно остановлено на бэкенде')
		} catch (error) {
			console.error('Ошибка при остановке уведомления:', error)
		}
	}
	const [userId, setUserId] = useState('')
	const [interval, setInterval] = useState('')
	const { user, logout } = useContext(UserContext)

	const handleSubmit = async () => {
		if (!interval) {
			Alert.alert('Ошибка', 'Пожалуйста, заполните все поля.')
			return
		}

		// Преобразуем interval в число
		const intervalNumber = parseInt(interval, 10)
		if (isNaN(intervalNumber) || intervalNumber <= 0) {
			Alert.alert('Ошибка', 'Введите корректное число минут > 0.')
			return
		}

		try {
			const response = await fetch(
				`${API_BASE_URL}/notifications/start-repeating`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						user_id: user.user_id,
						interval: intervalNumber,
					}),
				}
			)

			if (!response.ok) {
				const errData = await response.json()
				throw new Error(errData.error || 'Failed to start repeating')
			}

			const data = await response.json()
			Alert.alert(
				'Успешно',
				`Запущено повторное уведомление! setting_id=${data.setting_id}`
			)
		} catch (error) {
			console.error('Error starting repeating notifications:', error)
			Alert.alert('Ошибка', error.message)
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Настройка Повторных Уведомлений</Text>

			<Text style={styles.label}>Интервал (минуты):</Text>
			<TextInput
				style={styles.input}
				value={interval}
				onChangeText={setInterval}
				placeholder="Введите интервал (мин.)"
				keyboardType="numeric"
			/>

			<Button
				title="Запустить повторные уведомления"
				onPress={handleSubmit}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		// flex: 1,
		marginTop: 20,
		backgroundColor: '#fff',
		padding: 20,
		justifyContent: 'center',
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
	},
	label: {
		marginBottom: 5,
		marginTop: 15,
	},
	input: {
		margin: 15,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 5,
		padding: 10,
	},
})
