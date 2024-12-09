// navigation/ProfileNavigator.js

import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import UserInfoScreen from '../screens/UserInfoScreen'
import StatisticsScreen from '../screens/StatisticsScreen'
import styled from 'styled-components/native'

const TopTab = createMaterialTopTabNavigator()

const ProfileNavigator = () => {
	return (
		<TopTab.Navigator
			screenOptions={{
				tabBarActiveTintColor: '#0a84ff',
				tabBarInactiveTintColor: 'gray',
				tabBarStyle: { backgroundColor: '#000' },
				tabBarIndicatorStyle: { backgroundColor: '#0a84ff' },
				tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
			}}
		>
			<TopTab.Screen name="Информация" component={UserInfoScreen} />
			<TopTab.Screen name="Статистика" component={StatisticsScreen} />
		</TopTab.Navigator>
	)
}

export default ProfileNavigator
