// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_steep_spiral.sql';
import m0001 from './0001_brown_mac_gargan.sql';
import m0002 from './0002_strange_la_nuit.sql';
import m0003 from './0003_tiny_edwin_jarvis.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003
    }
  }
  