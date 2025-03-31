// screens/StatisticsScreen.js

import React, { useEffect, useState, useContext } from 'react'
import { FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import styled from 'styled-components/native'
import axios from 'axios'
import { API_BASE_URL } from '@env'
import { UserContext } from '../context/UserContext'
import withSafeScreen from '../HOC/withSafeScreen'

const StatisticsScreen = () => {
	const { user } = useContext(UserContext)
	const [statistics, setStatistics] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)

	const [refreshing, setRefreshing] = useState(false)

	const user_id = user ? user.user_id : null

	useEffect(() => {
		fetchStatistics()
	}, [])

	useEffect(() => {
		console.log('Полученная статистика:', statistics)
	}, [statistics])

	const fetchStatistics = async () => {
		try {
			setLoading(true)
			const response = await axios.get(
				`${API_BASE_URL}/user/statistics`,
				{
					params: { user_id },
				}
			)
			setStatistics(response.data)
			setLoading(false)
		} catch (err) {
			console.error('Ошибка при получении статистики:', err)
			setError(true)
			setLoading(false)
		}
	}

	const onRefresh = async () => {
		setRefreshing(true)
		await fetchStatistics()
		setRefreshing(false)
	}

	const renderStatistic = ({ item }) => (
		<StatisticContainer>
			<StatisticDate>
				{new Date(item.date).toLocaleDateString()}
			</StatisticDate>
			<StatisticDetail>
				<Label>Количество задач:</Label>
				<Value>{item.task_count}</Value>
			</StatisticDetail>
			<StatisticDetail>
				<Label>Завершено задач:</Label>
				<Value>{item.completed_tasks}</Value>
			</StatisticDetail>
			{/* Добавьте другие статистические данные по необходимости */}
		</StatisticContainer>
	)

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
				<ErrorText>Ошибка при загрузке статистики.</ErrorText>
			</Container>
		)
	}

	if (statistics.length === 0) {
		return (
			<Container>
				<InfoText>Статистика отсутствует.</InfoText>
			</Container>
		)
	}

	return (
		<Container>
			<FlatList
				data={statistics}
				// keyExtractor={'1'}
				renderItem={renderStatistic}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={['#0a84ff']}
					/>
				}
				contentContainerStyle={{ paddingBottom: 20 }}
			/>
		</Container>
	)
}

export default  withSafeScreen(StatisticsScreen)

// Стили
const Container = styled.View`
	flex: 1;
	background-color: #000;
	padding: 20px;
`

const StatisticContainer = styled.View`
	background-color: #1c1c1e;
	padding: 15px;
	border-radius: 10px;
	margin-bottom: 15px;
`

const StatisticDate = styled.Text`
	color: #0a84ff;
	font-size: 16px;
	margin-bottom: 10px;
`

const StatisticDetail = styled.View`
	flex-direction: row;
	margin-bottom: 5px;
`

const Label = styled.Text`
	color: #0a84ff;
	font-weight: bold;
	width: 150px;
`

const Value = styled.Text`
	color: #fff;
`

const ErrorText = styled.Text`
	color: red;
	font-size: 18px;
	text-align: center;
	margin-top: 20px;
`

const InfoText = styled.Text`
	color: #fff;
	font-size: 18px;
	text-align: center;
	margin-top: 20px;
`
