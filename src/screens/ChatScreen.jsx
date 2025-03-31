import React, { useState, useEffect, useCallback, useContext } from 'react'
import { ActivityIndicator, View, TouchableOpacity, Text } from 'react-native'
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import styled from 'styled-components/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '@env'
import { UserContext } from '../context/UserContext'

const PAGE_SIZE = 100000

const ChatScreen = () => {
	const { user } = useContext(UserContext)
	// Предположим, user.user_id = 1 — это «мой» пользователь.
	// Тогда любые сообщения, где user._id = 1, будут справа.

	const [messages, setMessages] = useState([])
	const [isLoadingInitial, setIsLoadingInitial] = useState(false)
	const [isLoadingEarlier, setIsLoadingEarlier] = useState(false)
	const [hasMore, setHasMore] = useState(true)
	const [oldestMessageId, setOldestMessageId] = useState(null)

	// --- Активные уведомления (пример)
	const [activeRepeatedNotifications, setActiveRepeatedNotifications] =
		useState([])

	// -------------------------------------------
	// ============  ЗАГРУЗКА / СОХРАНЕНИЕ  ======
	// -------------------------------------------
	const loadMessagesFromStorage = async () => {
		try {
			const key = `chat_${user?.user_id}`
			const stored = await AsyncStorage.getItem(key)
			if (stored) {
				const parsed = JSON.parse(stored)

				// Убедимся, что _id пользователя — число (если нужно).
				// Если бэк присылает _id как строку ('1'), можно привести к числу.
				const unified = parsed.map(m => unifyMessage(m))

				setMessages(unified)
				if (unified.length > 0) {
					const last = unified[unified.length - 1] // самое старое
					setOldestMessageId(last._id)
				} else {
					setHasMore(false)
				}
			}
		} catch (error) {
			console.error('Ошибка при загрузке из AsyncStorage:', error)
		}
	}

	const saveMessagesToStorage = async updatedMessages => {
		try {
			const key = `chat_${user?.user_id}`
			await AsyncStorage.setItem(key, JSON.stringify(updatedMessages))
		} catch (error) {
			console.error('Ошибка при сохранении в AsyncStorage:', error)
		}
	}

	// -------------------------------------------
	// ============   ФУНКЦИЯ ПРИВЕДЕНИЯ _id  =====
	// -------------------------------------------
	/**  
	 * unifyMessage: Приводит message.user._id к number, если это строка,
	 * чтобы GiftedChat мог сравнивать корректно (1 === 1, а не '1' === 1).
	 */
	const unifyMessage = msg => {
		// Приводим user._id к числу, если это строка
		let userIdNum = msg.user?._id
		if (typeof userIdNum === 'string') {
			userIdNum = parseInt(userIdNum, 10)
			if (Number.isNaN(userIdNum)) {
				// Если не удалось распарсить, оставим как есть
				userIdNum = msg.user._id
			}
		}

		// createdAt: GiftedChat ждет Date-объект, а не строку
		let created = msg.createdAt
		if (typeof created === 'string') {
			created = new Date(created)
		}

		return {
			...msg,
			_id: msg._id, // Можно тоже приводить к числу, если нужно
			createdAt: created,
			user: {
				...msg.user,
				_id: userIdNum,
			},
		}
	}

	// -------------------------------------------
	// ============   FETCH УВЕДОМЛЕНИЙ   ========
	// -------------------------------------------
	const fetchActiveNotifications = async userId => {
		try {
			const response = await fetch(
				`${API_BASE_URL}/notifications/active-repeated-notifications?user_id=${userId}`
			)
			if (!response.ok) {
				throw new Error('Ошибка при получении активных уведомлений')
			}
			const data = await response.json()
			const newNotifs = data.notifications || []
			setActiveRepeatedNotifications(newNotifs)

			// Если нужно добавить в чат отдельное сообщение с кнопкой «Cancel»
			if (newNotifs.length > 0) {
				// Создадим GPT-сообщение
				const notifsMsg = {
					_id: Date.now(), // или Date.now().toString()
					text: 'Активные уведомления:',
					createdAt: new Date(),
					user: { _id: 2, name: 'GPT' },
					custom: {
						repeatedNotifications: newNotifs,
					},
				}

				setMessages(prev => {
					const newState = GiftedChat.append(prev, [notifsMsg])
					saveMessagesToStorage(newState)
					return newState
				})
			}
		} catch (error) {
			console.error('fetchActiveNotifications error:', error)
		}
	}

	// -------------------------------------------
	// ============   ИНИЦИАЛИЗАЦИЯ   ============
	// -------------------------------------------
	useEffect(() => {
		if (user?.user_id) {
			loadMessagesFromStorage().then(() => {
				loadInitialMessages(user.user_id)
			})
			fetchActiveNotifications(user.user_id)
		}
	}, [user])

	// -------------------------------------------
	// ============   ПАГИНАЦИЯ   ================
	// -------------------------------------------
	const loadInitialMessages = async userId => {
		try {
			setIsLoadingInitial(true)
			const url = `${API_BASE_URL}/chat/history-paged?userId=${userId}&limit=${PAGE_SIZE}`
			const res = await fetch(url)
			if (!res.ok) {
				throw new Error('Failed to fetch chat history')
			}
			const data = await res.json()

			// Приводим все messages к корректному формату (числовой _id, Date и т.п.)
			const unifiedData = data.map(m => unifyMessage(m))

			setMessages(unifiedData)
			saveMessagesToStorage(unifiedData)

			if (unifiedData.length < PAGE_SIZE) {
				setHasMore(false)
			}
			if (unifiedData.length > 0) {
				const oldest = unifiedData[unifiedData.length - 1]
				setOldestMessageId(oldest._id)
			}
		} catch (error) {
			console.error('Ошибка при загрузке истории:', error)
		} finally {
			setIsLoadingInitial(false)
		}
	}

	const onLoadEarlier = async () => {
		if (!hasMore || !oldestMessageId || isLoadingEarlier) return

		try {
			setIsLoadingEarlier(true)
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
			const unifiedData = data.map(m => unifyMessage(m))

			setMessages(prev => {
				const updated = [...prev, ...unifiedData]
				saveMessagesToStorage(updated)
				return updated
			})

			const newOldest = unifiedData[unifiedData.length - 1]
			setOldestMessageId(newOldest._id)

			if (unifiedData.length < PAGE_SIZE) {
				setHasMore(false)
			}
		} catch (error) {
			console.error('Ошибка при подгрузке старых сообщений:', error)
		} finally {
			setIsLoadingEarlier(false)
		}
	}

	// -------------------------------------------
	// ============   ОТПРАВКА   =================
	// -------------------------------------------
	const onSend = useCallback(
		async (newMessages = []) => {
			// При отправке: user._id = 1 => будет справа
			// (или user.user_id, если ваш реальный ID пользователя)
			setMessages(previousMessages =>
				GiftedChat.append(previousMessages, newMessages)
			)
			saveMessagesToStorage([...newMessages, ...messages])

			try {
				const msgToSend = newMessages[0]
				const response = await fetch(`${API_BASE_URL}/chat`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						messages: [{ role: 'user', content: msgToSend.text }],
						userId: user.user_id,
					}),
				})
				if (!response.ok) {
					const errorData = await response.json()
					throw new Error(errorData.error || 'Ошибка при запросе')
				}
				const data = await response.json()

				// Ответ GPT
				const assistantMsg = {
					_id: Date.now(),
					text: data,
					createdAt: new Date(),
					user: { _id: 2, name: 'GPT' }, // => слева
				}

				setMessages(previousMessages =>
					GiftedChat.append(previousMessages, [assistantMsg])
				)
				await fetchActiveNotifications(user.user_id)

				saveMessagesToStorage([assistantMsg, ...messages])
			} catch (error) {
				console.error('Ошибка при отправке сообщения:', error)
			}
		},
		[messages, user]
	)

	// -------------------------------------------
	// ============  КАСТОМНЫЙ BUBBLE   ==========
	// -------------------------------------------
	// Позволяет задать цвета для "правых" (моих) и "левых" (GPT) сообщений.
	// А также отрисовать кнопки "Cancel" для уведомлений.
	const renderBubble = props => {
		const { currentMessage } = props

		if (currentMessage.custom?.repeatedNotifications) {
			// Если в сообщении есть уведомления, рисуем кнопку
			return (
				<View style={{ marginBottom: 10 }}>
					<Bubble
						{...props}
						wrapperStyle={{
							right: { backgroundColor: '#007aff' },
							left: { backgroundColor: '#333' },
						}}
						textStyle={{
							right: { color: '#fff' },
							left: { color: '#fff' },
						}}
					/>
					{currentMessage.custom.repeatedNotifications.map(notif => (
						<TouchableOpacity
							key={notif.id}
							onPress={() =>
								handleStopRepeating(
									notif.id,
									currentMessage._id
								)
							}
							style={{
								backgroundColor: '#b22222',
								paddingHorizontal: 10,
								paddingVertical: 5,
								marginTop: 5,
								borderRadius: 5,
							}}
						>
							<Text style={{ color: '#fff' }}>
								Cancel #{notif.id}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			)
		}

		// Обычный Bubble, без кнопок
		return (
			<Bubble
				{...props}
				wrapperStyle={{
					right: { backgroundColor: '#007aff' }, // синий
					left: { backgroundColor: '#333' }, // тёмный
				}}
				textStyle={{
					right: { color: '#fff' },
					left: { color: '#fff' },
				}}
			/>
		)
	}

	// -------------------------------------------
	// ============   ОСТАНОВКА НОТИФ.  ==========
	// -------------------------------------------
	const handleStopRepeating = async (repeatedSettingId, messageId) => {
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

			// 1) Убираем из списка активных
			setActiveRepeatedNotifications(prev =>
				prev.filter(item => item.id !== repeatedSettingId)
			)

			// 2) Удаляем из сообщения в чат (чтобы кнопка пропала)
			setMessages(prev =>
				prev.map(msg => {
					if (
						msg._id === messageId &&
						msg.custom?.repeatedNotifications
					) {
						const filtered =
							msg.custom.repeatedNotifications.filter(
								n => n.id !== repeatedSettingId
							)
						return {
							...msg,
							custom: {
								...msg.custom,
								repeatedNotifications: filtered,
							},
						}
					}
					return msg
				})
			)
		} catch (error) {
			console.error('Ошибка при остановке уведомления:', error)
		}
	}

	// -------------------------------------------
	// ============   РЕНДЕР   ===================
	// -------------------------------------------
	if (!user) {
		return (
			<NoUserContainer>
				<NoUserText>
					Пользователь не найден. Пожалуйста, войдите в систему.
				</NoUserText>
			</NoUserContainer>
		)
	}

	return (
		<Container>
			{isLoadingInitial ? (
				<ActivityIndicator
					size="large"
					color="#0a84ff"
					style={{ flex: 1 }}
				/>
			) : (
				<GiftedChat
					messages={messages}
					onSend={msgs => onSend(msgs)}
					// Указываем "мой" айди = 1 => все сообщения {user._id: 1} будут справа
					user={{ _id: 1, name: 'You' }}
					loadEarlier={hasMore}
					onLoadEarlier={onLoadEarlier}
					isLoadingEarlier={isLoadingEarlier}
					renderBubble={renderBubble}
				/>
			)}
		</Container>
	)
}

export default ChatScreen

// ------------------ СТИЛИ ------------------
const Container = styled.View`
	flex: 1;
	background-color: #100f0f;
`

const NoUserContainer = styled.View`
	flex: 1;
	align-items: center;
	justify-content: center;
	background-color: #100f0f;
`

const NoUserText = styled.Text`
	color: #fff;
	font-size: 16px;
`
