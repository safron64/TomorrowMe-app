import React, { useContext } from 'react'
import { View, Text, Button } from 'react-native'
import { UserContext } from '../context/UserContext'

const HomeScreen = () => {
	const { user, logout } = useContext(UserContext)
	console.log(user)

	return (
		<View style={{ flex: 1, backgroundColor: '#000', padding: 20 }}>
			<Text style={{ color: '#fff', fontSize: 24, marginBottom: 20 }}>
				Добро пожаловать, {user.first_name}!
			</Text>
			<Button title="Выйти" onPress={logout} />
		</View>
	)
}

export default HomeScreen
