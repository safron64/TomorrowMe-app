// utils/formatReminder.js

import moment from 'moment' // или moment-timezone, dayjs, etc.

export function formatReminderTime(value) {
	// 1) Если это объект offsetMs
	if (typeof value === 'object' && value !== null && 'offsetMs' in value) {
		const minutes = value.offsetMs / 60000
		return `Напоминание за ${minutes} мин.`
	}

	// 2) Если это строка, проверим, похоже ли она на ISO
	if (typeof value === 'string') {
		// Проверим, есть ли 'T' (грубая проверка на ISO)
		if (value.includes('T')) {
			// Попробуем распарсить как ISO‑дату
			const m = moment(value)
			if (m.isValid()) {
				// Отобразим локальное время
				return m.format('YYYY-MM-DD HH:mm')
			}
		}

		// 3) Если это строка формата 'HH:mm'
		if (/^\d{2}:\d{2}$/.test(value)) {
			// Считаем, что это ежедневное время
			return value
		}

		// Если всё остальное, вернём как есть:
		return value
	}

	// Если формат неизвестен
	return JSON.stringify(value)
}
