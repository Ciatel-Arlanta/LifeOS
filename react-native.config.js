const fs = require('fs');
const path = require('path');

// Windows Ninja fails when codegen object paths exceed 260 chars. The local
// APK script copies gesture-handler to C:\g so CMake sees a short root.
const shortGh = 'C:\\g';
const ghRoot = fs.existsSync(path.join(shortGh, 'package.json'))
  ? shortGh
  : path.dirname(require.resolve('react-native-gesture-handler/package.json'));

module.exports = {
  dependencies: {
    'react-native-gesture-handler': {
      root: ghRoot,
    },
  },
};
