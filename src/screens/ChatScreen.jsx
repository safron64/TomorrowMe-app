import React, { useState, useEffect, useRef, useContext } from 'react'
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
} from 'react-native'
import styled from 'styled-components/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MessageBubble from '../components/MessageBubble'
import useUser, { UserContext } from '../context/UserContext'
import { API_BASE_URL } from '@env'

const ChatScreen = () => {
	const [messages, setMessages] = useState([])
	const [inputText, setInputText] = useState('')
	const [loading, setLoading] = useState(false)
	const flatListRef = useRef(null)
	const { user, logout } = useContext(UserContext)

	useEffect(() => {
		loadChatHistory()
	}, [])
	

	const loadChatHistory = async () => {
		try {
			const savedMessages = await AsyncStorage.getItem('chatHistory')
			if (savedMessages) {
				setMessages(JSON.parse(savedMessages))
			} else {
				// Если истории нет, можно установить приветственное сообщение
				setMessages([
					{
						id: '1',
						text: 'Привет! Чем могу помочь?',
						sender: 'gpt',
					},
				])
			}
		} catch (error) {
			console.error('Ошибка при загрузке истории чата:', error)
		}
	}

	const saveChatHistory = async messages => {
		try {
			await AsyncStorage.setItem('chatHistory', JSON.stringify(messages))
		} catch (error) {
			console.error('Ошибка при сохранении истории чата:', error)
		}
	}

	const handleSend = async () => {
		if (!inputText.trim()) {
			return
		}

		const newMessage = {
			id: Date.now().toString(),
			text: inputText,
			sender: 'user',
		}
		const updatedMessages = [...messages, newMessage]
		setMessages(updatedMessages)
		setInputText('')
		flatListRef.current.scrollToEnd({ animated: true })
		setLoading(true)

		try {
			const response = await fetch(`${API_BASE_URL}/chat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messages: [{ role: 'user', content: inputText }],
					userId: userId,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(
					errorData.error || 'Ошибка при получении ответа от сервера'
				)
			}

			const data = await response.json()

			// Добавляем ответ ассистента в сообщения
			const assistantMessage = {
				id: (Date.now() + 1).toString(), // Добавляем 1 мс, чтобы ID был уникальным
				text: data, // Ответ ассистента от бэкенда
				sender: 'gpt',
			}
			const newMessages = [...updatedMessages, assistantMessage]
			setMessages(newMessages)
			saveChatHistory(newMessages)
			flatListRef.current.scrollToEnd({ animated: true })
		} catch (error) {
			console.error('Ошибка при отправке сообщения:', error)
			// Можно добавить отображение ошибки пользователю
		} finally {
			setLoading(false)
		}
	}

	if (!user) {
		return (
			<Container>
				<Text>
					Пользователь не найден. Пожалуйста, войдите в систему.
				</Text>
			</Container>
		)
	}

	const userId = user.user_id
	console.log('User ID:', userId)
	return (
		<Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
			<MessagesList
				ref={flatListRef}
				data={messages}
				keyExtractor={item => item.id}
				renderItem={({ item }) => <MessageBubble message={item} />}
				onContentSizeChange={() =>
					flatListRef.current.scrollToEnd({ animated: true })
				}
				onLayout={() =>
					flatListRef.current.scrollToEnd({ animated: true })
				}
			/>
			{loading && <ActivityIndicator size="large" color="#0a84ff" />}
			<InputContainer>
				<Input
					placeholder="Введите сообщение"
					value={inputText}
					onChangeText={setInputText}
					placeholderTextColor="#888"
				/>
				<SendButton onPress={handleSend}>
					<SendButtonText>Отправить</SendButtonText>
				</SendButton>
			</InputContainer>
		</Container>
	)
}

export default ChatScreen

const Container = styled.KeyboardAvoidingView`
	flex: 1;
	background-color: #100f0f;
`

const MessagesList = styled.FlatList`
	flex: 1;
	padding: 10px;
`

const InputContainer = styled.View`
	flex-direction: row;
	padding: 10px;
	background-color: #0f0e0e;
	align-items: center;
`

const Input = styled.TextInput`
	flex: 1;
	border: 1px solid #ccc;
	border-radius: 20px;
	padding: 10px 15px;
	margin-right: 10px;
	color: #fff;
`

const SendButton = styled.TouchableOpacity`
	background-color: #007aff;
	padding: 10px 15px;
	border-radius: 20px;
`

const SendButtonText = styled.Text`
	color: #fff;
	font-weight: bold;
`
