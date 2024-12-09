// UserContext.js
import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const loadUserData = async () => {
			try {
				console.log('Загрузка данных пользователя из AsyncStorage...')
				const userDataString = await AsyncStorage.getItem('user')
				console.log('Полученные данные:', userDataString)
				if (userDataString) {
					const userData = JSON.parse(userDataString)
					setUser(userData)
					console.log('Данные пользователя установлены:', userData)
				} else {
					console.log(
						'Данные пользователя отсутствуют в AsyncStorage.'
					)
				}
			} catch (error) {
				console.log('Ошибка при загрузке данных пользователя:', error)
			} finally {
				setLoading(false)
			}
		}

		loadUserData()
	}, [])

	const saveUser = async userData => {
		try {
			await AsyncStorage.setItem('user', JSON.stringify(userData))
			setUser(userData)
		} catch (error) {
			console.log('Ошибка при сохранении данных пользователя:', error)
		}
	}

	const logout = async () => {
		try {
			await AsyncStorage.removeItem('user')
			setUser(null)
		} catch (error) {
			console.log('Ошибка при выходе из аккаунта:', error)
		}
	}

	return (
		<UserContext.Provider value={{ user, loading, saveUser, logout }}>
			{children}
		</UserContext.Provider>
	)
}
