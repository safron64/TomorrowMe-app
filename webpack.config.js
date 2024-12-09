// const createExpoWebpackConfigAsync = require('@expo/webpack-config')

// module.exports = async function (env, argv) {
// 	const config = await createExpoWebpackConfigAsync(env, argv)

// 	config.resolve.allias = {
// 		...config.resolve.allias,
// 		crypto: 'crypto-browserify',
// 		stream: 'stream-browserify',
// 		assert: 'assert',
// 		vm: false,
// 	}

// 	config.resolve.fallback = {
// 		...config.resolve.fallback,
// 		crypto: require.resolve('crypto-browserify'),
// 		stream: require.resolve('stream-browserify'),
// 		assert: require.resolve('assert'),
// 		vm: false,
// 	}

// 	return config
// }
