import React from 'react'
import { Modal } from 'react-native'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'

export default function EventModal({
	modalVisible,
	editMode,
	eventName,
	eventStartTime,
	eventEndTime,
	setEventName,
	setEventStartTime,
	setEventEndTime,
	onSave,
	onClose,
}) {
	return (
		<Modal
			visible={modalVisible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<ModalContainer>
				<ModalContent>
					<ModalHeader>
						<ModalTitle>
							{editMode
								? 'Редактировать событие'
								: 'Новое событие'}
						</ModalTitle>
						<CloseButton onPress={onClose}>
							<Ionicons name="close" size={24} color="#0a84ff" />
						</CloseButton>
					</ModalHeader>
					<ModalInput
						value={eventName}
						onChangeText={setEventName}
						placeholder="Название события"
						placeholderTextColor="#888"
					/>
					<ModalInput
						value={eventStartTime}
						onChangeText={setEventStartTime}
						placeholder="Время начала (HH:MM)"
						placeholderTextColor="#888"
					/>
					<ModalInput
						value={eventEndTime}
						onChangeText={setEventEndTime}
						placeholder="Время окончания (HH:MM)"
						placeholderTextColor="#888"
					/>

					<SaveButton onPress={onSave}>
						<SaveButtonText>Сохранить</SaveButtonText>
					</SaveButton>
				</ModalContent>
			</ModalContainer>
		</Modal>
	)
}

const ModalContainer = styled.View`
	flex: 1;
	background-color: rgba(0, 0, 0, 0.7);
	justify-content: center;
	align-items: center;
`

const ModalContent = styled.View`
	background-color: #1c1c1e;
	width: 90%;
	padding: 20px;
	border-radius: 10px;
`

const ModalHeader = styled.View`
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
`

const ModalTitle = styled.Text`
	color: #fff;
	font-size: 20px;
	font-weight: bold;
`

const CloseButton = styled.TouchableOpacity`
	padding: 5px;
`

const ModalInput = styled.TextInput`
	border: 1px solid #444;
	border-radius: 5px;
	padding: 10px;
	color: #fff;
	margin-bottom: 20px;
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
