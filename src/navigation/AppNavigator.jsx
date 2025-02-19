// navigation/AppNavigator.js

import React, { useContext } from 'react'
import {
	NavigationContainer,
	DefaultTheme,
	DarkTheme,
} from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useColorScheme, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import styled from 'styled-components/native'

import RegistrationScreen from '../screens/RegistrationScreen'
import LoginScreen from '../screens/LoginScreen'
import HomeScreen from '../screens/HomeScreen'
import ToDoScreen from '../screens/ToDoScreen'
import ChatScreen from '../screens/ChatScreen'
import ProfileNavigator from './ProfileNavigator'
import { UserContext } from '../context/UserContext'
import EmailVerificationScreen from '../screens/EmailVerificationScreen'
import CalendarScreen from '../screens/CalendarScreen'
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen'
import GoalsScreen from '../screens/GoalsScreen'
import HabitsScreen from '../screens/HabitsScreen'
import DailyNotificationSettingsScreen from '../screens/DailyNotificationSettingsScreen'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabs() {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarActiveTintColor: '#0a84ff',
				tabBarInactiveTintColor: 'gray',
				tabBarStyle: { backgroundColor: '#000' },
				tabBarIcon: ({ color, size }) => {
					let iconName

					if (route.name === 'Home') {
						iconName = 'home'
					} else if (route.name === 'ToDo') {
						iconName = 'list'
					} else if (route.name === 'Chat') {
						iconName = 'chatbubble'
					} else if (route.name === 'Profile') {
						iconName = 'person'
					} else if (route.name === 'Calendar') {
						iconName = 'calendar-outline'
					}

					return (
						<Ionicons name={iconName} size={size} color={color} />
					)
				},
			})}
		>
			<Tab.Screen name="Home" component={HomeScreen} />
			<Tab.Screen name="ToDo" component={ToDoScreen} />
			<Tab.Screen name="Calendar" component={CalendarScreen} />
			<Tab.Screen name="Chat" component={ChatScreen} />
			<Tab.Screen name="Profile" component={ProfileNavigator} />
		</Tab.Navigator>
	)
}

export default function AppNavigator() {
	const colorScheme = useColorScheme()
	const { user, loading } = useContext(UserContext) // Получаем user и loading из UserContext

	if (loading) {
		return (
			<LoadingContainer>
				<ActivityIndicator size="large" color="#0a84ff" />
			</LoadingContainer>
		)
	}

	return (
		<NavigationContainer
			theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
		>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				{user ? (
					<>
						<Stack.Screen name="MainTabs" component={MainTabs} />
						<Stack.Screen
							name="NotificationSettings"
							component={NotificationSettingsScreen}
							options={{ headerShown: true }}
						/>
						<Stack.Screen
							name="Goals"
							component={GoalsScreen}
							options={{ headerShown: true }}
						/>
						<Stack.Screen
							name="Habits"
							component={HabitsScreen}
							options={{ headerShown: true }}
						/>
						<Stack.Screen
							name="DailyNotificationSettings"
							component={DailyNotificationSettingsScreen}
							options={{ headerShown: true }}
						/>
					</>
				) : (
					<>
						<Stack.Screen name="Login" component={LoginScreen} />
						<Stack.Screen
							name="Registration"
							component={RegistrationScreen}
						/>
						<Stack.Screen
							name="EmailVerification"
							component={EmailVerificationScreen}
						/>
					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	)
}

const LoadingContainer = styled.View`
	flex: 1;
	justify-content: center;
	align-items: center;
	background-color: #000;
`
