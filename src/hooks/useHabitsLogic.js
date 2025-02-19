import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { fetchHabits } from '../api/habits'

// Префикс для хранения в AsyncStorage
const STORAGE_PREFIX = 'completedHabits'

// Функция, чтобы возвращать строку текущей даты в формате YYYY-MM-DD
const getTodayString = () => {
	const today = new Date()
	const y = today.getFullYear()
	const m = (today.getMonth() + 1).toString().padStart(2, '0')
	const d = today.getDate().toString().padStart(2, '0')
	return `${y}-${m}-${d}`
}

export function useHabitsLogic(user_id) {
	const [habits, setHabits] = useState([])
	const [dropdownVisible, setDropdownVisible] = useState(false)
	const [completedHabits, setCompletedHabits] = useState([])
	const [notificationModalVisible, setNotificationModalVisible] =
		useState(false)
	const [selectedHabit, setSelectedHabit] = useState(null)

	// Храним «сегодняшнюю» дату, чтобы при её смене сбрасывать или загружать данные
	const [todayStr, setTodayStr] = useState(getTodayString())

	// ─────────────────────────────────────────────────────────
	// 1. Загружаем привычки с бэка
	// ─────────────────────────────────────────────────────────
	const loadHabits = useCallback(async () => {
		if (!user_id) return
		try {
			const data = await fetchHabits(user_id)
			if (data) {
				setHabits(data)
			}
		} catch (error) {
			console.log('Ошибка загрузки привычек', error)
		}
	}, [user_id])

	// ─────────────────────────────────────────────────────────
	// 2. Загружаем completedHabits из AsyncStorage для текущей даты
	// ─────────────────────────────────────────────────────────
	useEffect(() => {
		// Асинхронная функция, которая читает данные из AsyncStorage
		const loadCompletedHabitsForToday = async () => {
			try {
				const key = `${STORAGE_PREFIX}_${todayStr}` // Например: completedHabits_2025-02-07
				const storedData = await AsyncStorage.getItem(key)
				if (storedData) {
					setCompletedHabits(JSON.parse(storedData))
				} else {
					// Если нет данных, сбрасываем в пустой массив
					setCompletedHabits([])
				}
			} catch (error) {
				console.log('Ошибка загрузки completedHabits', error)
				setCompletedHabits([])
			}
		}

		loadCompletedHabitsForToday()
	}, [todayStr])

	// ─────────────────────────────────────────────────────────
	// 3. Сохраняем completedHabits в AsyncStorage при любом изменении
	// ─────────────────────────────────────────────────────────
	useEffect(() => {
		const saveCompletedHabitsForToday = async () => {
			try {
				const key = `${STORAGE_PREFIX}_${todayStr}`
				await AsyncStorage.setItem(key, JSON.stringify(completedHabits))
			} catch (error) {
				console.log('Ошибка сохранения completedHabits', error)
			}
		}

		saveCompletedHabitsForToday()
	}, [completedHabits, todayStr])

	// ─────────────────────────────────────────────────────────
	// 4. Если приложение остаётся открытым и дата меняется —
	//    Можно отлавливать это и сбрасывать completedHabits.
	//    Простой вариант: Проверять дату при каждом новом рендере.
	// ─────────────────────────────────────────────────────────
	useEffect(() => {
		const currentDay = getTodayString()
		if (currentDay !== todayStr) {
			// Дата изменилась - сбрасываем стейт и грузим заново
			setTodayStr(currentDay)
		}
		// Можно поставить таймер/интервал, но аккуратнее с лишними рендерами
	}, [todayStr])

	// При нажатии на переключатель (Switch)
	const handleCheckHabit = (habitId, value) => {
		if (value) {
			// Добавляем в список выполненных
			setCompletedHabits(prev => [...prev, habitId])
		} else {
			// Убираем из списка
			setCompletedHabits(prev => prev.filter(id => id !== habitId))
		}
	}

	// Открыть/закрыть дропдаун
	const toggleDropdown = () => {
		setDropdownVisible(!dropdownVisible)
	}

	// Открыть модалку уведомлений
	const openNotificationModal = habit => {
		setSelectedHabit(habit)
		setNotificationModalVisible(true)
	}

	const closeNotificationModal = () => {
		setNotificationModalVisible(false)
		setSelectedHabit(null)
	}

	// Сохранить настройки уведомлений (пример)
	const saveNotificationSettings = () => {
		alert(
			`Сохраняем настройки для привычки: ${selectedHabit?.habit_description}`
		)
		closeNotificationModal()
	}

	return {
		habits,
		dropdownVisible,
		completedHabits,
		notificationModalVisible,
		selectedHabit,
		loadHabits,
		handleCheckHabit,
		toggleDropdown,
		openNotificationModal,
		closeNotificationModal,
		saveNotificationSettings,
	}
}
