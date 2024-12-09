// screens/UserInfoScreen.js

import React, { useEffect, useState, useContext } from 'react'
import {
	Alert,
	TouchableOpacity,
	Modal,
	ActivityIndicator,
	ScrollView,
} from 'react-native'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import { API_BASE_URL } from '@env'
import { UserContext } from '../context/UserContext'

const UserInfoScreen = () => {
	const { user, saveUser  } = useContext(UserContext)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)

	const [modalVisible, setModalVisible] = useState(false)
	const [editData, setEditData] = useState({ ...user })

	useEffect(() => {
		fetchUserData()
	}, [])

	const fetchUserData = async () => {
		try {
			setLoading(true)
			const response = await axios.get(`${API_BASE_URL}/user`, {
				params: { user_id: user.user_id },
			})
			saveUser (response.data)
			setEditData(response.data)
			setLoading(false)
		} catch (err) {
			console.error('Ошибка при получении данных пользователя:', err)
			setError(true)
			setLoading(false)
		}
	}

	const handleUpdateUser = async () => {
		try {
			const response = await axios.put(
				`${API_BASE_URL}/user`,
				editData,
				{
					params: { user_id: user.user_id },
				}
			)
			saveUser (response.data)
			Alert.alert('Успешно', 'Данные пользователя обновлены.')
			setModalVisible(false)
		} catch (err) {
			console.error('Ошибка при обновлении данных пользователя:', err)
			Alert.alert('Ошибка', 'Не удалось обновить данные пользователя.')
		}
	}

	if (loading) {
		return (
			<Container>
				<ActivityIndicator size="large" color="#0a84ff" />
			</Container>
		)
	}

	if (error) {
		return (
			<Container>
				<ErrorText>Ошибка при загрузке данных пользователя.</ErrorText>
			</Container>
		)
	}

	return (
		<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
			<Container>
				<Header>
					<Title>Профиль</Title>
					<TouchableOpacity onPress={() => setModalVisible(true)}>
						<Ionicons name="pencil" size={24} color="#0a84ff" />
					</TouchableOpacity>
				</Header>
				<InfoContainer>
					<InfoItem>
						<Label>Имя:</Label>
						<Value>{user.first_name || 'Не указано'}</Value>
					</InfoItem>
					<InfoItem>
						<Label>Фамилия:</Label>
						<Value>{user.last_name || 'Не указано'}</Value>
					</InfoItem>
					<InfoItem>
						<Label>Предпочитаемое имя:</Label>
						<Value>{user.preferred_name || 'Не указано'}</Value>
					</InfoItem>
					<InfoItem>
						<Label>Возраст:</Label>
						<Value>{user.age || 'Не указано'}</Value>
					</InfoItem>
					<InfoItem>
						<Label>Семейное положение:</Label>
						<Value>{user.family_status || 'Не указано'}</Value>
					</InfoItem>
					<InfoItem>
						<Label>Город:</Label>
						<Value>{user.city || 'Не указано'}</Value>
					</InfoItem>
					<InfoItem>
						<Label>Часовой пояс:</Label>
						<Value>{user.timezone || 'Не указано'}</Value>
					</InfoItem>
					<InfoItem>
						<Label>Занятость:</Label>
						<Value>{user.occupation || 'Не указано'}</Value>
					</InfoItem>
					<InfoItem>
						<Label>Компания или учебное заведение:</Label>
						<Value>
							{user.company_or_school_name || 'Не указано'}
						</Value>
					</InfoItem>
					<InfoItem>
						<Label>Должность или область обучения:</Label>
						<Value>
							{user.position_or_field_of_study || 'Не указано'}
						</Value>
					</InfoItem>
					<InfoItem>
						<Label>Лет на работе или учебе:</Label>
						<Value>
							{user.years_at_job_or_study || 'Не указано'}
						</Value>
					</InfoItem>
					<InfoItem>
						<Label>Замечания о стабильности эмоций:</Label>
						<Value>
							{user.emotional_stability_notes || 'Не указано'}
						</Value>
					</InfoItem>
					<InfoItem>
						<Label>Стиль общения:</Label>
						<Value>
							{user.communication_style || 'Не указано'}
						</Value>
					</InfoItem>
					<InfoItem>
						<Label>Дополнительные заметки:</Label>
						<Value>{user.custom_notes || 'Не указано'}</Value>
					</InfoItem>
					<InfoItem>
						<Label>Пользовательское поле:</Label>
						<Value>{user.custom_field || 'Не указано'}</Value>
					</InfoItem>
				</InfoContainer>

				{/* Модальное окно для обновления данных пользователя */}
				<Modal
					visible={modalVisible}
					transparent
					animationType="slide"
					onRequestClose={() => setModalVisible(false)}
				>
					<ModalContainer>
						<ModalContent>
							<ModalHeader>
								<ModalTitle>Обновить данные</ModalTitle>
								<TouchableOpacity
									onPress={() => setModalVisible(false)}
								>
									<Ionicons
										name="close"
										size={24}
										color="#0a84ff"
									/>
								</TouchableOpacity>
							</ModalHeader>
							<ScrollView>
								{/* Повторите для всех необходимых полей */}
								<InputContainer>
									<LabelInput>Имя:</LabelInput>
									<Input
										value={editData.first_name || ''}
										onChangeText={text =>
											setEditData({
												...editData,
												first_name: text,
											})
										}
										placeholder="Имя"
										placeholderTextColor="#888"
									/>
								</InputContainer>
								<InputContainer>
									<LabelInput>Фамилия:</LabelInput>
									<Input
										value={editData.last_name || ''}
										onChangeText={text =>
											setEditData({
												...editData,
												last_name: text,
											})
										}
										placeholder="Фамилия"
										placeholderTextColor="#888"
									/>
								</InputContainer>
								<InputContainer>
									<LabelInput>Предпочитаемое имя:</LabelInput>
									<Input
										value={editData.preferred_name || ''}
										onChangeText={text =>
											setEditData({
												...editData,
												preferred_name: text,
											})
										}
										placeholder="Предпочитаемое имя"
										placeholderTextColor="#888"
									/>
								</InputContainer>
								<InputContainer>
									<LabelInput>Возраст:</LabelInput>
									<Input
										value={
											editData.age
												? editData.age.toString()
												: ''
										}
										onChangeText={text =>
											setEditData({
												...editData,
												age: parseInt(text),
											})
										}
										placeholder="Возраст"
										placeholderTextColor="#888"
										keyboardType="numeric"
									/>
								</InputContainer>
								<InputContainer>
									<LabelInput>Семейное положение:</LabelInput>
									<Input
										value={editData.family_status || ''}
										onChangeText={text =>
											setEditData({
												...editData,
												family_status: text,
											})
										}
										placeholder="Семейное положение"
										placeholderTextColor="#888"
									/>
								</InputContainer>
								<InputContainer>
									<LabelInput>Город:</LabelInput>
									<Input
										value={editData.city || ''}
										onChangeText={text =>
											setEditData({
												...editData,
												city: text,
											})
										}
										placeholder="Город"
										placeholderTextColor="#888"
									/>
								</InputContainer>
								<InputContainer>
									<LabelInput>Часовой пояс:</LabelInput>
									<Input
										value={editData.timezone || ''}
										onChangeText={text =>
											setEditData({
												...editData,
												timezone: text,
											})
										}
										placeholder="Часовой пояс"
										placeholderTextColor="#888"
									/>
								</InputContainer>
								<InputContainer>
									<LabelInput>Занятость:</LabelInput>
									<Input
										value={editData.occupation || ''}
										onChangeText={text =>
											setEditData({
												...editData,
												occupation: text,
											})
										}
										placeholder="Занятость"
										placeholderTextColor="#888"
									/>
								</InputContainer>
								<InputContainer>
									<LabelInput>
										Компания или учебное заведение:
									</LabelInput>
									<Input
										value={
											editData.company_or_school_name ||
											''
										}
										onChangeText={text =>
											setEditData({
												...editData,
												company_or_school_name: text,
											})
										}
										placeholder="Компания или учебное заведение"
										placeholderTextColor="#888"
									/>
								</InputContainer>
								<InputContainer>
									<LabelInput>
										Должность или область обучения:
									</LabelInput>
									<Input
										value={
											editData.position_or_field_of_study ||
											''
										}
										onChangeText={text =>
											setEditData({
												...editData,
												position_or_field_of_study:
													text,
											})
										}
										placeholder="Должность или область обучения"
										placeholderTextColor="#888"
									/>
								</InputContainer>
								<InputContainer>
									<LabelInput>
										Лет на работе или учебе:
									</LabelInput>
									<Input
										value={
											editData.years_at_job_or_study
												? editData.years_at_job_or_study.toString()
												: ''
										}
										onChangeText={text =>
											setEditData({
												...editData,
												years_at_job_or_study:
													parseInt(text),
											})
										}
										placeholder="Лет на работе или учебе"
										placeholderTextColor="#888"
										keyboardType="numeric"
									/>
								</InputContainer>
								<InputContainer>
									<LabelInput>
										Замечания о стабильности эмоций:
									</LabelInput>
									<Input
										value={
											editData.emotional_stability_notes ||
											''
										}
										onChangeText={text =>
											setEditData({
												...editData,
												emotional_stability_notes: text,
											})
										}
										placeholder="Замечания о стабильности эмоций"
										placeholderTextColor="#888"
									/>
								</InputContainer>
								<InputContainer>
									<LabelInput>Стиль общения:</LabelInput>
									<Input
										value={
											editData.communication_style || ''
										}
										onChangeText={text =>
											setEditData({
												...editData,
												communication_style: text,
											})
										}
										placeholder="Стиль общения"
										placeholderTextColor="#888"
									/>
								</InputContainer>
								<InputContainer>
									<LabelInput>
										Дополнительные заметки:
									</LabelInput>
									<Input
										value={editData.custom_notes || ''}
										onChangeText={text =>
											setEditData({
												...editData,
												custom_notes: text,
											})
										}
										placeholder="Дополнительные заметки"
										placeholderTextColor="#888"
									/>
								</InputContainer>
								<InputContainer>
									<LabelInput>
										Пользовательское поле:
									</LabelInput>
									<Input
										value={editData.custom_field || ''}
										onChangeText={text =>
											setEditData({
												...editData,
												custom_field: text,
											})
										}
										placeholder="Пользовательское поле"
										placeholderTextColor="#888"
									/>
								</InputContainer>
							</ScrollView>
							<SaveButton onPress={handleUpdateUser}>
								<SaveButtonText>Сохранить</SaveButtonText>
							</SaveButton>
						</ModalContent>
					</ModalContainer>
				</Modal>
			</Container>
		</ScrollView>
	)
}

export default UserInfoScreen

// Стили
const Container = styled.View`
	flex: 1;
	background-color: #000;
	padding: 20px;
`

const Header = styled.View`
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
`

const Title = styled.Text`
	color: #fff;
	font-size: 32px;
	font-weight: bold;
`

const InfoContainer = styled.View`
	background-color: #1c1c1e;
	padding: 20px;
	border-radius: 10px;
`

const InfoItem = styled.View`
	flex-direction: row;
	margin-bottom: 10px;
`

const Label = styled.Text`
	color: #0a84ff;
	font-weight: bold;
	width: 200px;
`

const Value = styled.Text`
	color: #fff;
	flex: 1;
`

// Модальное окно
const ModalContainer = styled.View`
	flex: 1;
	background-color: rgba(0, 0, 0, 0.7);
	justify-content: center;
	align-items: center;
`

const ModalContent = styled.View`
	background-color: #1c1c1e;
	padding: 20px;
	border-radius: 10px;
	width: 90%;
	max-height: 80%;
`

const ModalHeader = styled.View`
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
`

const ModalTitle = styled.Text`
	color: #fff;
	font-size: 20px;
	font-weight: bold;
`

const InputContainer = styled.View`
	margin-bottom: 15px;
`

const LabelInput = styled.Text`
	color: #0a84ff;
	margin-bottom: 5px;
`

const Input = styled.TextInput`
	border: 1px solid #444;
	border-radius: 5px;
	padding: 10px;
	color: #fff;
`

const SaveButton = styled.TouchableOpacity`
	background-color: #0a84ff;
	padding: 15px;
	border-radius: 5px;
	align-items: center;
	margin-top: 10px;
`

const SaveButtonText = styled.Text`
	color: #fff;
	font-weight: bold;
	font-size: 18px;
`

const ErrorText = styled.Text`
	color: red;
	font-size: 18px;
	text-align: center;
	margin-top: 20px;
`
