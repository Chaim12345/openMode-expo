const { withAndroidManifest, AndroidConfig, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const { getMainApplicationOrThrow } = AndroidConfig.Manifest;

const withNetworkSecurityConfig = (config) => {
  config = withDangerousMod(config, {
    platform: 'android',
    action: async (config) => {
      const srcPath = path.resolve(config.modRequest.projectRoot, 'assets/network_security_config.xml');
      const destDir = path.resolve(
        config.modRequest.platformProjectRoot,
        'app/src/main/res/xml'
      );
      const destPath = path.join(destDir, 'network_security_config.xml');
      if (fs.existsSync(srcPath)) {
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(srcPath, destPath);
      }
      return config;
    },
  });

  config = withAndroidManifest(config, async (config) => {
    const app = getMainApplicationOrThrow(config.modResults);
    if (!app.$) app.$ = {};
    app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    return config;
  });

  return config;
};

module.exports = withNetworkSecurityConfig;
