import React, { useState, useEffect, useRef, useContext } from 'react'
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
	Text,
	View,
} from 'react-native'
import styled from 'styled-components/native'
import MessageBubble from '../components/MessageBubble'
import { UserContext } from '../context/UserContext'
import { API_BASE_URL } from '@env'
import AsyncStorage from '@react-native-async-storage/async-storage'

const PAGE_SIZE = 20

const ChatScreen = () => {
	const [messages, setMessages] = useState([])
	const [loading, setLoading] = useState(false)
	const [loadingOlder, setLoadingOlder] = useState(false)
	const [hasMore, setHasMore] = useState(true)
	const [oldestMessageId, setOldestMessageId] = useState(null)
	const [inputText, setInputText] = useState('')

	// --- Активные повторяющиеся уведомления ---
	const [activeRepeatedNotifications, setActiveRepeatedNotifications] =
		useState([])

	const flatListRef = useRef(null)
	const { user } = useContext(UserContext)

	// --- Кнопка "прокрутить вниз" ---
	const [showScrollDownBtn, setShowScrollDownBtn] = useState(false)

	const loadMessagesFromStorage = async () => {
		try {
			const stored = await AsyncStorage.getItem(`chat_${user?.user_id}`)
			if (stored) {
				const parsed = JSON.parse(stored)
				setMessages(parsed)

				if (parsed.length > 0) {
					const firstId = parsed[0].id
					const numericId = parseIdNumber(firstId)
					setOldestMessageId(numericId)
					setHasMore(true)
				} else {
					setHasMore(false)
				}
			}
		} catch (error) {
			console.error(
				'Ошибка при загрузке сообщений из AsyncStorage:',
				error
			)
		}
	}

	const saveMessagesToStorage = async updatedMessages => {
		try {
			await AsyncStorage.setItem(
				`chat_${user?.user_id}`,
				JSON.stringify(updatedMessages)
			)
		} catch (error) {
			console.error(
				'Ошибка при сохранении сообщений в AsyncStorage:',
				error
			)
		}
	}

	useEffect(() => {
		if (user?.user_id) {
			loadMessagesFromStorage().then(() => {
				loadInitialMessages(user.user_id)
			})
			// Загружаем активные нотификации
			fetchActiveNotifications(user.user_id)
		}
	}, [user])

	useEffect(() => {
		if (user?.user_id) {
			const interval = setInterval(() => {
				checkForNewMessages()
			}, 300000)
			return () => clearInterval(interval)
		}
	}, [user, messages])

	const checkForNewMessages = async () => {
		try {
			const url = `${API_BASE_URL}/chat/history-paged?userId=${user.user_id}&limit=${PAGE_SIZE}`
			const res = await fetch(url)
			if (!res.ok)
				throw new Error('Ошибка при запросе обновления сообщений')

			const data = await res.json()
			if (
				data.length > 0 &&
				JSON.stringify(data) !== JSON.stringify(messages)
			) {
				setMessages(data)
				saveMessagesToStorage(data)
				if (data.length > 0) {
					const firstId = data[0].id
					setOldestMessageId(parseIdNumber(firstId))
				}
			}
		} catch (error) {
			console.error('Ошибка при фоновом обновлении сообщений:', error)
		}
	}

	const loadInitialMessages = async userId => {
		try {
			setLoading(true)
			const url = `${API_BASE_URL}/chat/history-paged?userId=${userId}&limit=${PAGE_SIZE}`
			const res = await fetch(url)
			if (!res.ok) {
				throw new Error('Failed to fetch chat history')
			}
			const data = await res.json()

			setMessages(data)
			saveMessagesToStorage(data)

			if (data.length < PAGE_SIZE) {
				setHasMore(false)
			}

			if (data.length > 0) {
				const firstId = data[0].id
				setOldestMessageId(parseIdNumber(firstId))
			}

			// Прокрутка вниз
			setTimeout(() => {
				flatListRef.current?.scrollToOffset({
					offset: 0,
					animated: false,
				})
			}, 0)
		} catch (error) {
			console.error('Ошибка при загрузке истории:', error)
		} finally {
			setLoading(false)
		}
	}

	const loadOlderMessages = async () => {
		if (!hasMore || !oldestMessageId || loadingOlder) return
		try {
			setLoadingOlder(true)
			const url = `${API_BASE_URL}/chat/history-paged?userId=${user.user_id}&limit=${PAGE_SIZE}&beforeId=${oldestMessageId}`
			const res = await fetch(url)
			if (!res.ok) {
				throw new Error('Failed to fetch older messages')
			}
			const data = await res.json()
			if (data.length === 0) {
				setHasMore(false)
				return
			}
			setMessages(prev => {
				const updated = [...prev, ...data]
				saveMessagesToStorage(updated)
				return updated
			})
			const newFirstId = data[0].id
			setOldestMessageId(parseIdNumber(newFirstId))

			if (data.length < PAGE_SIZE) {
				setHasMore(false)
			}
		} catch (error) {
			console.error('Ошибка при подгрузке старых сообщений:', error)
		} finally {
			setLoadingOlder(false)
		}
	}

	const parseIdNumber = fullId => {
		const parts = fullId.split('-')
		return parseInt(parts[1], 10)
	}

	const handleEndReached = () => {
		loadOlderMessages()
	}

	const handleSend = async () => {
		if (!inputText.trim()) return
		const localTimestamp = new Date().toISOString()
		const newUserMsg = {
			id: `user-${Date.now()}`,
			text: inputText,
			sender: 'user',
			timestamp: localTimestamp,
		}
		setMessages(prev => {
			const updated = [newUserMsg, ...prev]
			saveMessagesToStorage(updated)
			return updated
		})
		setInputText('')

		setTimeout(() => {
			flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
		}, 0)

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
			const data = await response.json()
			const assistantMsg = {
				id: `ai-${Date.now() + 1}`,
				text: data,
				sender: 'gpt',
				timestamp: new Date().toISOString(),
			}
			setMessages(prev => {
				const updated = [assistantMsg, ...prev]
				saveMessagesToStorage(updated)
				return updated
			})
			setTimeout(() => {
				flatListRef.current?.scrollToOffset({
					offset: 0,
					animated: true,
				})
			}, 0)
		} catch (error) {
			console.error('Ошибка при отправке сообщения:', error)
		} finally {
			setLoading(false)
		}
	}

	/**
	 *  Отслеживаем прокрутку:
	 *  - если offsetY > ~200 => показываем кнопку "Вниз"
	 */
	const handleScroll = event => {
		const offsetY = event.nativeEvent.contentOffset.y
		if (offsetY > 200) {
			if (!showScrollDownBtn) setShowScrollDownBtn(true)
		} else {
			if (showScrollDownBtn) setShowScrollDownBtn(false)
		}
	}

	// --- Загрузка всех активных повторяющихся уведомлений ---
	const fetchActiveNotifications = async userId => {
		try {
			// Если метод на бэке принимает user_id через query
			const response = await fetch(
				`${API_BASE_URL}/notifications/active-repeated-notifications?user_id=${userId}`
			)
			if (!response.ok) {
				throw new Error(
					'Ошибка при получении активных повторяющихся уведомлений'
				)
			}
			const data = await response.json()
			// Ожидаем, что в data: { success: true, notifications: [...] }
			setActiveRepeatedNotifications(data.notifications || [])
		} catch (error) {
			console.error(error)
		}
	}

	// --- Остановка конкретного уведомления ---
	const handleStopRepeating = async repeatedSettingId => {
		try {
			const response = await fetch(`${API_BASE_URL}/notifications/stop`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					repeated_setting_id: repeatedSettingId,
				}),
			})
			if (!response.ok) {
				throw new Error('Failed to stop repeated notification')
			}
			// Убираем из стейта, чтобы кнопка исчезла
			setActiveRepeatedNotifications(prev =>
				prev.filter(item => item.id !== repeatedSettingId)
			)
		} catch (error) {
			console.error(
				'Ошибка при остановке повторяющегося уведомления:',
				error
			)
		}
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
			{/* Блок с активными повторяющимися нотификациями */}
			<RepeatedNotificationsContainer>
				{activeRepeatedNotifications.map(notif => (
					<StopNotifButton
						key={notif.id}
						onPress={() => handleStopRepeating(notif.id)}
					>
						<StopNotifButtonText>
							Остановить #{notif.id}
						</StopNotifButtonText>
					</StopNotifButton>
				))}
			</RepeatedNotificationsContainer>

			<MessagesList
				ref={flatListRef}
				data={messages}
				keyExtractor={item => item.id}
				renderItem={({ item }) => <MessageBubble message={item} />}
				inverted
				maintainVisibleContentPosition={{
					minIndexForVisible: 1,
					autoscrollToTopThreshold: 20,
				}}
				onEndReachedThreshold={0.1}
				onEndReached={handleEndReached}
				onScroll={handleScroll}
				scrollEventThrottle={16}
			/>

			{(loading || loadingOlder) && (
				<ActivityIndicator size="large" color="#0a84ff" />
			)}

			{/* Кнопка Прокрутить "Вниз" */}
			{showScrollDownBtn && (
				<ScrollDownButton
					onPress={() =>
						flatListRef.current?.scrollToOffset({
							offset: 0,
							animated: true,
						})
					}
				>
					<ScrollDownButtonText>⬇</ScrollDownButtonText>
				</ScrollDownButton>
			)}

			<InputContainer>
				<Input
					placeholder="Введите сообщение"
					placeholderTextColor="#888"
					value={inputText}
					onChangeText={setInputText}
					multiline
				/>
				<SendButton onPress={handleSend}>
					<SendButtonText>Отправить</SendButtonText>
				</SendButton>
			</InputContainer>
		</Container>
	)
}

export default ChatScreen

// ------------------ СТИЛИ ------------------

const Container = styled(KeyboardAvoidingView)`
	flex: 1;
	background-color: #100f0f;
`

const RepeatedNotificationsContainer = styled.View`
	padding: 10px;
	background-color: #1d1d1d;
	flex-direction: row;
	flex-wrap: wrap;
`

const StopNotifButton = styled.TouchableOpacity`
	padding: 8px 12px;
	background-color: #b22222;
	border-radius: 5px;
	margin-right: 8px;
	margin-bottom: 8px;
`

const StopNotifButtonText = styled.Text`
	color: #fff;
	font-weight: 500;
	font-size: 14px;
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

const ScrollDownButton = styled.TouchableOpacity`
	position: absolute;
	right: 35px;
	bottom: 80px;
	background-color: #1c1c1c;
	height: 50px;
	width: 50px;
	border-radius: 50px;
	z-index: 10;
	align-items: center;
	justify-content: center;
`

const ScrollDownButtonText = styled.Text`
	color: #fff;
	font-weight: bold;
	font-size: 25px;
`
