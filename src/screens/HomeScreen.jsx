import React, { useContext } from 'react'
import { View, Text, Button } from 'react-native'
import { UserContext } from '../context/UserContext'
import { useNavigation } from '@react-navigation/native'

const HomeScreen = () => {
	const { user, logout } = useContext(UserContext)
	const navigation = useNavigation()

	const handleLogout = async () => {
		await logout()
	}

	return (
		<View style={{ flex: 1, backgroundColor: '#000', padding: 20 }}>
			{user ? (
				<Text style={{ color: '#fff', fontSize: 24, marginBottom: 20 }}>
					Добро пожаловать, {user.first_name}!
				</Text>
			) : (
				<Text style={{ color: '#fff', fontSize: 24, marginBottom: 20 }}>
					Загрузка...
				</Text>
			)}
			<Button
				style={{ marginBottom: 20 }}
				title="Уведомления"
				onPress={() => navigation.navigate('NotificationSettings')}
			/>
			<Button title="Выйти" onPress={handleLogout} />
		</View>
	)
}

export default HomeScreen
