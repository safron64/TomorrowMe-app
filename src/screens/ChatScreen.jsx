import React, { useState, useEffect, useRef, useContext } from 'react'
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import styled from 'styled-components/native'
import MessageBubble from '../components/MessageBubble'
import { UserContext } from '../context/UserContext'
import { API_BASE_URL } from '@env'

const ChatScreen = () => {
	const [messages, setMessages] = useState([])
	const [inputText, setInputText] = useState('')
	const [loading, setLoading] = useState(false)
	const [isAtBottom, setIsAtBottom] = useState(true)
	const flatListRef = useRef(null)
	const { user } = useContext(UserContext)

	useEffect(() => {
		if (user && user.user_id) {
			loadChatHistory(user.user_id)
			// Прокрутить вниз сразу
			flatListRef.current?.scrollToEnd({ animated: true })
		}
	}, [user])

	useEffect(() => {
		if (isAtBottom) {
			flatListRef.current?.scrollToEnd({ animated: true })
		}
	}, [messages])

	const loadChatHistory = async userId => {
		try {
			setLoading(true)
			const res = await fetch(
				`${API_BASE_URL}/chat/history?userId=${userId}`
			)
			if (!res.ok) {
				throw new Error('Failed to fetch chat history')
			}
			const data = await res.json()
			// Важно: если сервер не отдаёт timestamp, можно сгенерировать
			// или парсить, если приходит. В данном примере оставим «как есть».
			setMessages(data)
			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: true })
			}, 0)
		} catch (error) {
			console.error('Ошибка при загрузке истории:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleSend = async () => {
		if (!inputText.trim()) return

		// 1. Создаём локальное сообщение с timestamp, чтобы сразу отобразить время
		const localTimestamp = new Date().toISOString()

		const newMessage = {
			id: Date.now().toString(),
			text: inputText,
			sender: 'user',
			timestamp: localTimestamp, // сразу проставляем время
		}

		// Добавляем в локальный массив
		const updatedMessages = [...messages, newMessage]
		setMessages(updatedMessages)
		setInputText('')

		// Скроллим вниз, если пользователь был внизу
		if (isAtBottom) {
			flatListRef.current?.scrollToEnd({ animated: true })
		}

		try {
			setLoading(true)
			const response = await fetch(`${API_BASE_URL}/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: [{ role: 'user', content: inputText }],
					userId: user.user_id,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Ошибка при запросе')
			}

			// 2. Получаем ответ ассистента
			const data = await response.json()

			// Тоже проставим timestamp (либо получаем от сервера, если он присылает)
			const serverTimestamp = new Date().toISOString()

			const assistantMessage = {
				id: (Date.now() + 1).toString(),
				text: data, // предполагаем, что сервер вернул строку
				sender: 'gpt',
				timestamp: serverTimestamp,
			}

			const newMessagesArr = [...updatedMessages, assistantMessage]
			setMessages(newMessagesArr)

			// Скроллим вниз
			if (isAtBottom) {
				setTimeout(() => {
					flatListRef.current?.scrollToEnd({ animated: true })
				}, 0)
			}
		} catch (error) {
			console.error('Ошибка при отправке сообщения:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleScroll = event => {
		const { contentOffset, contentSize, layoutMeasurement } =
			event.nativeEvent
		const distanceFromBottom =
			contentSize.height - (contentOffset.y + layoutMeasurement.height)
		setIsAtBottom(distanceFromBottom < 500)
	}

	if (!user) {
		return (
			<Container>
				<Text style={{ color: '#fff' }}>
					Пользователь не найден. Пожалуйста, войдите в систему.
				</Text>
			</Container>
		)
	}

	return (
		<Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
			<MessagesList
				ref={flatListRef}
				data={messages}
				keyExtractor={item => item.id}
				renderItem={({ item }) => <MessageBubble message={item} />}
				onScroll={handleScroll}
				scrollEventThrottle={16}
			/>

			{loading && <ActivityIndicator size="large" color="#0a84ff" />}

			{!isAtBottom && (
				<ScrollToBottomButton
					onPress={() => {
						setTimeout(() => {
							flatListRef.current?.scrollToEnd({ animated: true })
						}, 100)
					}}
				>
					<ScrollToBottomButtonText>↓</ScrollToBottomButtonText>
				</ScrollToBottomButton>
			)}

			<InputContainer>
				<Input
					placeholder="Введите сообщение"
					value={inputText}
					onChangeText={setInputText}
					placeholderTextColor="#888"
					multiline // Чтобы при длинном вводе текст переносился
				/>
				<SendButton onPress={handleSend}>
					<SendButtonText>Отправить</SendButtonText>
				</SendButton>
			</InputContainer>
		</Container>
	)
}

export default ChatScreen

const Container = styled(KeyboardAvoidingView)`
	flex: 1;
	background-color: #100f0f;
`

const MessagesList = styled(FlatList)`
	flex: 1;
	padding: 10px;
`

const InputContainer = styled.View`
	flex-direction: row;
	padding: 10px;
	background-color: #0f0e0e;
	align-items: flex-end;
`

const Input = styled.TextInput`
	flex: 1;
	border: 1px solid #ccc;
	border-radius: 20px;
	padding: 10px 15px;
	margin-right: 10px;
	color: #fff;
	/* multiline = true; можно добавлять maxHeight или что-то похожее */
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

// Кнопка "Вниз"
const ScrollToBottomButton = styled.TouchableOpacity`
	position: absolute;
	right: 20px;
	bottom: 80px;
	background-color: #333;
	padding: 10px 20px;
	border-radius: 50px;
	justify-content: center;
	align-items: center;
`

const ScrollToBottomButtonText = styled.Text`
	color: #fff;
	font-size: 20px;
	font-weight: bold;
`
