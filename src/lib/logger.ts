
'use server';

import * as db from './db';
import type { LogEntry } from '../types';

type LogInput = Omit<LogEntry, 'id' | 'timestamp'>;

export async function writeLog(logInput: LogInput) {
    const logEntry: LogEntry = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        ...logInput
    };
    await db.addLog(logEntry);
}
