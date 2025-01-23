#!/usr/bin/env node
import { updateCheck } from '@directus/update-check';
import { version } from './version.js';

if (version) {
	await updateCheck(version);
}

import('quantum_directus_api/cli/run.js');
