import React from 'react'
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native'

const withSafeScreen = WrappedComponent => {
	return props => {
		return (
			<View style={styles.container}>
				<StatusBar barStyle="light-content" backgroundColor="black" />
				<SafeAreaView style={styles.safeArea}>
					<WrappedComponent {...props} />
				</SafeAreaView>
			</View>
		)
	}
}

export default withSafeScreen

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black', // Чёрный фон StatusBar
	},
	safeArea: {
		flex: 1,
		backgroundColor: 'black', // Фон SafeArea
	},
})
