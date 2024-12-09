import React from 'react'
import styled from 'styled-components/native'

const MessageBubble = React.memo(({ message }) => {
	const isUser = message.sender === 'user'
	return (
		<BubbleContainer isUser={isUser}>
			<Bubble isUser={isUser}>
				<MessageText isUser={isUser}>{message.text}</MessageText>
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
`
