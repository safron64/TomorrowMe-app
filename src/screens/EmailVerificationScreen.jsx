import React, { useContext, useState } from 'react'
import { Alert } from 'react-native'
import styled from 'styled-components/native'
import { UserContext } from '../context/UserContext'
import { API_BASE_URL } from '@env'
import withSafeScreen from '../HOC/withSafeScreen'

const EmailVerificationScreen = ({ route, navigation }) => {
	const [code, setCode] = useState('')
	const { user_id } = route.params
	const { saveUser } = useContext(UserContext) // Получаем saveUser из контекста

	const handleVerify = async () => {
		if (!code.trim()) {
			Alert.alert('Ошибка', 'Пожалуйста, введите код подтверждения.')
			return
		}

		try {
			const response = await fetch(`${API_BASE_URL}/auth/verify`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ user_id, verification_code: code }),
			})

			const responseData = await response.json()

			if (!response.ok) {
				throw new Error(
					responseData.message || 'Ошибка при подтверждении'
				)
			}

			Alert.alert(
				'Успешно',
				'Ваш аккаунт подтвержден. Пожалуйста, войдите в систему.'
			)

			const newUser = { user_id }
			saveUser(newUser)
		} catch (error) {
			Alert.alert('Ошибка', error.message)
		}
	}

	return (
		<Container>
			<Title>Подтверждение Email</Title>
			<Input
				placeholder="Введите код подтверждения"
				value={code}
				onChangeText={setCode}
				keyboardType="default"
			/>
			<Button onPress={handleVerify}>
				<ButtonText>Подтвердить</ButtonText>
			</Button>
		</Container>
	)
}

export default  withSafeScreen(EmailVerificationScreen)

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
