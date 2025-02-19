import React from 'react'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'

export default function EventItem({ event, onEdit, onDelete }) {
	const { name, startTime, endTime } = event
	return (
		<EventContainer>
			<EventText>
				{name} - {startTime}
				{endTime !== startTime ? ` - ${endTime}` : ''}
			</EventText>
			<ButtonsRow>
				<EditButton onPress={onEdit}>
					<Ionicons name="pencil" size={20} color="#0a84ff" />
				</EditButton>
				<DeleteButton onPress={onDelete}>
					<Ionicons name="trash" size={20} color="#ff3b30" />
				</DeleteButton>
			</ButtonsRow>
		</EventContainer>
	)
}

const EventContainer = styled.View`
	background-color: #1c1c1e;
	padding: 10px;
	border-radius: 5px;
	margin-bottom: 10px;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
`

const EventText = styled.Text`
	color: #fff;
`

const ButtonsRow = styled.View`
	flex-direction: row;
	align-items: center;
`

const EditButton = styled.TouchableOpacity`
	margin-right: 15px;
`

const DeleteButton = styled.TouchableOpacity``
