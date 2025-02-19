import React from 'react'
import { FlatList, Switch } from 'react-native'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'

export default function HabitsDropdown({
	habits,
	dropdownVisible,
	completedHabits,
	onToggleDropdown,
	onCheckHabit,
	onOpenNotificationModal,
}) {
	return (
		<>
			<DropdownHeader onPress={onToggleDropdown}>
				<DropdownHeaderText>Мои привычки</DropdownHeaderText>
				<Ionicons
					name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
					size={20}
					color="#fff"
				/>
			</DropdownHeader>

			{dropdownVisible && (
				<HabitsContainer>
					<FlatList
						data={habits}
						keyExtractor={item => item.habit_id.toString()}
						renderItem={({ item }) => {
							const isCompleted = completedHabits.includes(
								item.habit_id
							)
							return (
								<HabitRow>
									<HabitInfo>
										<HabitName>
											{item.habit_description}
										</HabitName>
										{item.habit_time && (
											<HabitTime>
												{item.habit_time}
											</HabitTime>
										)}
									</HabitInfo>
									<HabitActions>
										<Switch
											value={isCompleted}
											onValueChange={value =>
												onCheckHabit(
													item.habit_id,
													value
												)
											}
										/>
										<NotificationButton
											onPress={() =>
												onOpenNotificationModal(item)
											}
										>
											<Ionicons
												name="notifications"
												size={20}
												color="#0a84ff"
											/>
										</NotificationButton>
									</HabitActions>
								</HabitRow>
							)
						}}
					/>
				</HabitsContainer>
			)}
		</>
	)
}

const DropdownHeader = styled.TouchableOpacity`
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	background-color: #1c1c1e;
	padding: 10px;
	border-radius: 5px;
	margin-bottom: 10px;
`

const DropdownHeaderText = styled.Text`
	color: #fff;
	font-size: 16px;
	font-weight: bold;
`

const HabitsContainer = styled.View`
	background-color: #1c1c1e;
	border-radius: 5px;
	max-height: 200px;
	margin-bottom: 10px;
`

const HabitRow = styled.View`
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding: 10px;
	border-bottom-color: #333;
	border-bottom-width: 1px;
`

const HabitInfo = styled.View`
	flex: 1;
`

const HabitName = styled.Text`
	color: #fff;
	font-size: 16px;
`

const HabitTime = styled.Text`
	color: #999;
	font-size: 14px;
`

const HabitActions = styled.View`
	flex-direction: row;
	align-items: center;
`

const NotificationButton = styled.TouchableOpacity`
	margin-left: 10px;
`
