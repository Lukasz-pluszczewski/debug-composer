import debugTools from './debugTools';
import createLogger from './logger';

export const configureDebugger = debugTools.configureDebugger;
export const resetDebugger = debugTools.clearLocalStorage;
export default createLogger;
