// components/MessageBubble.jsx

import React from 'react'
import styled from 'styled-components/native'

const MessageBubble = React.memo(({ message }) => {
	const isUser = message.sender === 'user'

	// Функция форматирования времени: "HH:MM"
	const formatTime = timestamp => {
		if (!timestamp) return ''
		const date = new Date(timestamp)
		const hours = date.getHours().toString().padStart(2, '0')
		const minutes = date.getMinutes().toString().padStart(2, '0')
		return `${hours}:${minutes}`
	}

	return (
		<BubbleContainer isUser={isUser}>
			<Bubble isUser={isUser}>
				<MessageText isUser={isUser}>{message.text}</MessageText>
				<TimeText isUser={isUser}>
					{formatTime(message.timestamp)}
				</TimeText>
			</Bubble>
		</BubbleContainer>
	)
})

export default MessageBubble

// Styled Components
const BubbleContainer = styled.View`
	flex-direction: row;
	justify-content: ${props => (props.isUser ? 'flex-end' : 'flex-start')};
	margin-bottom: 10px;
`

const Bubble = styled.View`
	background-color: ${props => (props.isUser ? '#007aff' : '#e5e5ea')};
	padding: 10px 15px;
	border-radius: 20px;
	max-width: 80%;
`

const MessageText = styled.Text`
	color: ${props => (props.isUser ? '#fff' : '#000')};
	font-size: 16px;
	margin-bottom: 4px; /* Чтобы текст и время не слипались */
`

const TimeText = styled.Text`
	font-size: 12px;
	color: ${props => (props.isUser ? 'rgba(255,255,255,0.8)' : '#555')};
	align-self: flex-end; /* Чтобы время «уходило» вправо */
`
