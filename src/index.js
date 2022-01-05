#!/usr/bin/env node

import commands from './commands/index.js';

await commands.create('auth');
commands.execute();