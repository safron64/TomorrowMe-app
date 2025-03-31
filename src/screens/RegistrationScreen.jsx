import React, { useState, useContext } from 'react'
import { Alert, ScrollView } from 'react-native'
import styled from 'styled-components/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '@env'
import { useNavigation } from '@react-navigation/native'
import { UserContext } from '../context/UserContext' // Импортируем контекст
import withSafeScreen from '../HOC/withSafeScreen'

const RegistrationScreen = () => {
	const navigation = useNavigation()

	const [formData, setFormData] = useState({
		email: null,
		password: null,
		first_name: null,
		last_name: null,
		preferred_name: null,
		age: null,
		family_status: null,
		city: null,
		timezone: null,
		occupation: null,
		company_or_school_name: null,
		position_or_field_of_study: null,
		years_at_job_or_study: null,
		emotional_stability_notes: null,
	})

	const handleChange = (name, value) => {
		setFormData({ ...formData, [name]: value })
	}

	const handleSubmit = async () => {
		if (!formData.email.trim()) {
			Alert.alert('Ошибка', 'Пожалуйста, введите электронную почту.')
			return
		}

		try {
			const response = await fetch(`${API_BASE_URL}/auth/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			})

			const responseData = await response.json()

			if (!response.ok) {
				throw new Error(
					responseData.message || 'Ошибка при регистрации'
				)
			} else {
				// responseData: { message, user_id }
				await AsyncStorage.setItem(
					'user_id',
					responseData.user_id.toString()
				)
				// Переход на экран верификации
				navigation.navigate('EmailVerification', {
					user_id: responseData.user_id,
				})
			}
		} catch (error) {
			Alert.alert('Ошибка', error.message)
		}
	}

	return (
		<Container>
			<ScrollView>
				<Title>Регистрация</Title>
				<Input
					placeholder="Электронная почта *"
					value={formData.email}
					onChangeText={text => handleChange('email', text)}
					keyboardType="email-address"
				/>
				<Input
					placeholder="Пароль *"
					value={formData.password}
					onChangeText={text => handleChange('password', text)}
					secureTextEntry={true}
				/>
				<Input
					placeholder="Имя"
					value={formData.first_name}
					onChangeText={text => handleChange('first_name', text)}
				/>
				<Input
					placeholder="Фамилия"
					value={formData.last_name}
					onChangeText={text => handleChange('last_name', text)}
				/>
				<Input
					placeholder="Предпочитаемое имя"
					value={formData.preferred_name}
					onChangeText={text => handleChange('preferred_name', text)}
				/>
				<Input
					placeholder="Возраст"
					value={formData.age}
					onChangeText={text => handleChange('age', text)}
					keyboardType="numeric"
				/>
				<Input
					placeholder="Семейный статус"
					value={formData.family_status}
					onChangeText={text => handleChange('family_status', text)}
				/>
				<Input
					placeholder="Город"
					value={formData.city}
					onChangeText={text => handleChange('city', text)}
				/>
				<Input
					placeholder="Род занятий"
					value={formData.occupation}
					onChangeText={text => handleChange('occupation', text)}
				/>
				<Input
					placeholder="Компания или учебное заведение"
					value={formData.company_or_school_name}
					onChangeText={text =>
						handleChange('company_or_school_name', text)
					}
				/>
				<Input
					placeholder="Должность или направление обучения"
					value={formData.position_or_field_of_study}
					onChangeText={text =>
						handleChange('position_or_field_of_study', text)
					}
				/>
				<Input
					placeholder="Стаж работы или обучения (в годах)"
					value={formData.years_at_job_or_study}
					onChangeText={text =>
						handleChange('years_at_job_or_study', text)
					}
					keyboardType="numeric"
				/>

				<Button onPress={handleSubmit}>
					<ButtonText>Зарегистрироваться</ButtonText>
				</Button>

				<SwitchContainer>
					<SwitchText>Уже есть аккаунт?</SwitchText>
					<SwitchButton onPress={() => navigation.navigate('Login')}>
						<SwitchButtonText>Войти</SwitchButtonText>
					</SwitchButton>
				</SwitchContainer>
			</ScrollView>
		</Container>
	)
}

export default withSafeScreen(RegistrationScreen)

// Стили
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
