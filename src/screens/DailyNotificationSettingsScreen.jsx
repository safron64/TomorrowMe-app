import React, { useEffect, useState, useContext } from 'react'
import styled from 'styled-components/native'
import { View, Alert, Switch } from 'react-native'
import { UserContext } from '../context/UserContext'
import { API_BASE_URL } from '@env'

export default function DailyNotificationSettingsScreen() {
	const { user } = useContext(UserContext)
	const userId = user?.user_id

	const [notifications, setNotifications] = useState([])

	useEffect(() => {
		if (!userId) return
		loadData()
	}, [userId])

	async function loadData() {
		try {
			const res = await fetch(
				`${API_BASE_URL}/notifications/daily-notifications?user_id=${userId}`
			)
			if (!res.ok) {
				const err = await res.json()
				throw new Error(
					err.error || 'Failed to load daily notifications'
				)
			}
			const data = await res.json()
			// data = array of { setting_id, user_id, notification_type, time, is_active }
			setNotifications(data)
		} catch (error) {
			console.error('Error loading daily notifications:', error)
			Alert.alert('Ошибка', error.message)
		}
	}

	function handleTimeChange(index, newTime) {
		// update notifications[index].time
		const updated = [...notifications]
		updated[index].time = newTime
		setNotifications(updated)
	}

	function handleIsActiveChange(index, value) {
		// update notifications[index].is_active
		const updated = [...notifications]
		updated[index].is_active = value
		setNotifications(updated)
	}

	async function handleSave() {
		// POST /notifications/daily-notifications
		try {
			const res = await fetch(
				`${API_BASE_URL}/notifications/daily-notifications`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						user_id: userId,
						notifications: notifications.map(n => ({
							type: n.notification_type,
							time: n.time,
							is_active: n.is_active,
						})),
					}),
				}
			)
			if (!res.ok) {
				const err = await res.json()
				throw new Error(err.error || err.message || 'Failed to update')
			}
			const data = await res.json()
			Alert.alert(
				'Успешно',
				data.message || 'Daily notifications updated!'
			)
		} catch (error) {
			console.error('Error saving daily notifications:', error)
			Alert.alert('Ошибка', error.message)
		}
	}

	return (
		<Container>
			<Title>Настройка ежедневных уведомлений</Title>

			{notifications.map((item, index) => (
				<NotificationRow key={item.setting_id || index}>
					<Label>{item.notification_type}</Label>
					<TimeInput
						value={item.time}
						onChangeText={text => handleTimeChange(index, text)}
						placeholder="HH:mm"
					/>
					<Switch
						value={item.is_active}
						onValueChange={val => handleIsActiveChange(index, val)}
					/>
				</NotificationRow>
			))}

			<SaveButton onPress={handleSave}>
				<SaveButtonText>Сохранить</SaveButtonText>
			</SaveButton>
		</Container>
	)
}

const Container = styled.View`
	flex: 1;
	background-color: #000000;
	padding: 20px;
	margin-top: 50px;
`

const Title = styled.Text`
	font-size: 20px;
	font-weight: bold;
	margin-bottom: 20px;
	color: #fff;
`

const NotificationRow = styled.View`
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 15px;
`

const Label = styled.Text`
	font-size: 16px;
	width: 100px;
	color: #fff;
`

const TimeInput = styled.TextInput`
	width: 80px;
	border: 1px solid #ccc;
	border-radius: 5px;
	padding: 5px 10px;
	margin-right: 10px;
	text-align: center;
	color: #fff;
`

const SaveButton = styled.TouchableOpacity`
	background-color: #007aff;
	padding: 15px;
	border-radius: 5px;
	align-items: center;
	margin-top: 30px;
	color: #fff;
`

const SaveButtonText = styled.Text`
	color: #fff;
	font-weight: bold;
	font-size: 16px;
`
