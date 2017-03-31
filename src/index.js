import debugToolsImp from './debugTools';
import createLogger from './logger';

export const debugTools = debugToolsImp;
export const configureDebugger = debugTools.configureDebugger;
export const resetDebugger = debugTools.clearLocalStorage;
export default createLogger;
