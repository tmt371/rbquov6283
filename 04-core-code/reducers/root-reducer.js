// File: 04-core-code/reducers/root-reducer.js

/**
 * @fileoverview This is the single source of truth for all state mutation logic.
 * It has been refactored into a "combiner" that delegates actions to sub-reducers.
 */

import { uiReducer } from './ui-reducer.js';
import { quoteReducer } from './quote-reducer.js';

export function createRootReducer(dependencies) {
    const { productFactory, configManager } = dependencies;

    // This is the combined root reducer.
    return function rootReducer(state, action) {
        // Delegate UI actions to the uiReducer.
        const newUiState = uiReducer(state.ui, action);

        // Delegate quote data actions to the quoteReducer, passing dependencies.
        const newQuoteState = quoteReducer(state.quoteData, action, { productFactory, configManager });

        // If neither sub-reducer changed its part of the state, return the original state.
        if (newUiState === state.ui && newQuoteState === state.quoteData) {
            return state;
        }

        // Otherwise, combine the results into a new state object.
        return {
            ...state,
            ui: newUiState,
            quoteData: newQuoteState,
        };
    };
}