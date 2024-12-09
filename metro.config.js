const { getDefaultConfig } = require('expo/metro-config')

const defaultConfig = getDefaultConfig(__dirname)

module.exports = {
	...defaultConfig,
	resolver: {
		...defaultConfig.resolver,
		extraNodeModules: {
			'missing-asset-registry-path': require.resolve(
				'react-native/Libraries/Image/AssetRegistry'
			),
		},
	},
}
