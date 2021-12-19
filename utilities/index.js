/* eslint-disable import/no-import-module-exports */
/* eslint-disable import/extensions */

const functions = require('./gameState.js');

console.log(functions);
// import { useGameState } from './gameState.js';

const useGameStateRef = functions.useGameState;

exports.useGameState = useGameStateRef;
