import React, { useContext, useState } from 'react'
import { Alert, ScrollView, TouchableOpacity } from 'react-native'
import styled from 'styled-components/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { UserContext } from '../context/UserContext'
import { API_BASE_URL } from '@env'

const LoginScreen = ({ navigation }) => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const { saveUser } = useContext(UserContext)
	const handleLogin = async () => {
		if (!email.trim() || !password.trim()) {
			Alert.alert(
				'Ошибка',
				'Пожалуйста, введите электронную почту и пароль.'
			)
			return
		}

		try {
			console.log('ti')
			const response = await fetch(`${API_BASE_URL}/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			})

			const responseData = await response.json()
			console.log(responseData)

			if (!response.ok) {
				throw new Error(
					responseData.message || 'Ошибка при авторизации'
				)
			}

			// Сохраняем данные пользователя
			await AsyncStorage.setItem(
				'user',
				JSON.stringify(responseData.user)
			)
			saveUser(responseData.user)

			// Логирование для проверки
			console.log(
				'Данные пользователя сохранены в AsyncStorage:',
				responseData.user
			)
			Alert.alert('Успешно', 'Вы успешно вошли в систему.')
		} catch (error) {
			Alert.alert('Ошибка', error.message)
			console.log(error)
		}
	}
	return (
		<Container>
			<ScrollView>
				<Title>Вход</Title>
				<Input
					placeholder="Электронная почта"
					value={email}
					onChangeText={setEmail}
					keyboardType="email-address"
				/>
				<Input
					placeholder="Пароль"
					value={password}
					onChangeText={setPassword}
					secureTextEntry={true}
				/>
				<Button onPress={handleLogin}>
					<ButtonText>Войти</ButtonText>
				</Button>

				<SwitchContainer>
					<SwitchText>Нет аккаунта?</SwitchText>
					<SwitchButton
						onPress={() => navigation.navigate('Registration')}
					>
						<SwitchButtonText>Зарегистрироваться</SwitchButtonText>
					</SwitchButton>
				</SwitchContainer>
			</ScrollView>
		</Container>
	)
}

export default LoginScreen

// Стили
const Container = styled.View`
	flex: 1;
	background-color: #000;
	padding: 20px;
	padding-top: 50px;
`

const Title = styled.Text`
	color: #fff;
	font-size: 32px;
	font-weight: bold;
	text-align: center;
	margin-bottom: 20px;
`

const Input = styled.TextInput`
	border: 1px solid #444;
	border-radius: 5px;
	padding: 10px;
	color: #fff;
	margin-bottom: 15px;
`

const Button = styled.TouchableOpacity`
	background-color: #0a84ff;
	padding: 15px;
	border-radius: 5px;
	align-items: center;
	margin-top: 10px;
`

const ButtonText = styled.Text`
	color: #fff;
	font-weight: bold;
	font-size: 18px;
`

const SwitchContainer = styled.View`
	flex-direction: row;
	justify-content: center;
	margin-top: 20px;
`

const SwitchText = styled.Text`
	color: #fff;
	font-size: 16px;
`

const SwitchButton = styled.TouchableOpacity`
	margin-left: 5px;
`

const SwitchButtonText = styled.Text`
	color: #0a84ff;
	font-size: 16px;
	font-weight: bold;
`
