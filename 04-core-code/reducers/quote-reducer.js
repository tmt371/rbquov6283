// File: 04-core-code/reducers/quote-reducer.js

import { QUOTE_ACTION_TYPES } from '../config/action-types.js';
import { initialState } from '../config/initial-state.js';

function _consolidateEmptyRows(items, productFactory, productKey) {
    let newItems = [...items];
    if (!newItems || newItems.length === 0) return [];

    while (newItems.length > 1) {
        const lastItem = newItems[newItems.length - 1];
        const secondLastItem = newItems[newItems.length - 2];
        const isLastItemEmpty = !lastItem.width && !lastItem.height && !lastItem.fabricType;
        const isSecondLastItemEmpty = !secondLastItem.width && !secondLastItem.height && !secondLastItem.fabricType;

        if (isLastItemEmpty && isSecondLastItemEmpty) {
            newItems.pop();
        } else {
            break;
        }
    }

    const lastItem = newItems[newItems.length - 1];
    if (lastItem && (lastItem.width || lastItem.height)) {
        const productStrategy = productFactory.getProductStrategy(productKey);
        newItems.push(productStrategy.getInitialItemData());
    }
    
    return newItems;
}

export function quoteReducer(state, action, { productFactory, configManager }) {
    const productKey = state.currentProduct;
    let productData = state.products[productKey];
    let items;

    switch (action.type) {
        case QUOTE_ACTION_TYPES.SET_QUOTE_DATA:
            return action.payload.newQuoteData;

        case QUOTE_ACTION_TYPES.RESET_QUOTE_DATA:
            return JSON.parse(JSON.stringify(initialState.quoteData));
        
        case QUOTE_ACTION_TYPES.INSERT_ROW: {
            items = [...productData.items];
            const productStrategy = productFactory.getProductStrategy(productKey);
            const newItem = productStrategy.getInitialItemData();
            items.splice(action.payload.selectedIndex + 1, 0, newItem);
            productData = { ...productData, items };
            return { ...state, products: { ...state.products, [productKey]: productData } };
        }

        case QUOTE_ACTION_TYPES.DELETE_ROW: {
            items = [...productData.items];
            const { selectedIndex } = action.payload;
            const itemToDelete = items[selectedIndex];
            if (!itemToDelete) return state;

            const isLastPopulatedRow = selectedIndex === items.length - 2 && items.length > 1 && !items[items.length - 1].width && !items[items.length-1].height;

            if (isLastPopulatedRow || items.length === 1) {
                const productStrategy = productFactory.getProductStrategy(productKey);
                const newItem = productStrategy.getInitialItemData();
                newItem.itemId = itemToDelete.itemId;
                items[selectedIndex] = newItem;
            } else {
                items.splice(selectedIndex, 1);
            }
            items = _consolidateEmptyRows(items, productFactory, productKey);
            productData = { ...productData, items };
            return { ...state, products: { ...state.products, [productKey]: productData } };
        }
        
        case QUOTE_ACTION_TYPES.CLEAR_ROW: {
            items = [...productData.items];
            const { selectedIndex } = action.payload;
            const itemToClear = items[selectedIndex];
            if (itemToClear) {
                const productStrategy = productFactory.getProductStrategy(productKey);
                const newItem = productStrategy.getInitialItemData();
                newItem.itemId = itemToClear.itemId;
                items[selectedIndex] = newItem;
                productData = { ...productData, items };
                return { ...state, products: { ...state.products, [productKey]: productData } };
            }
            return state;
        }

        case QUOTE_ACTION_TYPES.UPDATE_ITEM_VALUE: {
            items = [...productData.items];
            const { rowIndex, column, value } = action.payload;
            const targetItem = items[rowIndex];
            if (!targetItem || targetItem[column] === value) return state;
            
            const newItem = { ...targetItem, [column]: value };

            if ((column === 'width' || column === 'height') && newItem.width && newItem.height) {
                const logicThresholds = configManager.getLogicThresholds();
                if (logicThresholds && (newItem.width * newItem.height) > logicThresholds.hdWinderThresholdArea && !newItem.motor) {
                    newItem.winder = 'HD';
                }
            }
            items[rowIndex] = newItem;
            items = _consolidateEmptyRows(items, productFactory, productKey);
            productData = { ...productData, items };
            return { ...state, products: { ...state.products, [productKey]: productData } };
        }
        
        case QUOTE_ACTION_TYPES.BATCH_UPDATE_PROPERTY: {
            items = productData.items.map((item, index) => {
                if (index === productData.items.length - 1) {
                    return item; // Exclude the last (empty backup) row from batch updates.
                }
                return { ...item, [action.payload.property]: action.payload.value };
            });
            productData = { ...productData, items };
            return { ...state, products: { ...state.products, [productKey]: productData } };
        }

        case QUOTE_ACTION_TYPES.BATCH_UPDATE_PROPERTY_BY_TYPE: {
            items = [...productData.items];
            const { type, property, value, indexesToExclude } = action.payload;
            items = items.map((item, index) => {
                if (!indexesToExclude.has(index) && item.fabricType === type && item[property] !== value) {
                    return { ...item, [property]: value };
                }
                return item;
            });
            productData = { ...productData, items };
            return { ...state, products: { ...state.products, [productKey]: productData } };
        }

        case QUOTE_ACTION_TYPES.UPDATE_ITEM_PROPERTY: {
            items = [...productData.items];
            const { rowIndex, property, value } = action.payload;
            const item = items[rowIndex];
            if (!item || item[property] === value) return state;
            items[rowIndex] = { ...item, [property]: value };
            productData = { ...productData, items };
            return { ...state, products: { ...state.products, [productKey]: productData } };
        }
        
        case QUOTE_ACTION_TYPES.UPDATE_WINDER_MOTOR_PROPERTY: {
            items = [...productData.items];
            const { rowIndex, property, value } = action.payload;
            const item = items[rowIndex];
            if (!item || item[property] === value) return state;

            const newItem = { ...item, [property]: value };
            if (property === 'winder' && value) newItem.motor = '';
            if (property === 'motor' && value) newItem.winder = '';
            
            items[rowIndex] = newItem;
            productData = { ...productData, items };
            return { ...state, products: { ...state.products, [productKey]: productData } };
        }

        case QUOTE_ACTION_TYPES.CYCLE_K3_PROPERTY: {
            items = [...productData.items];
            const { rowIndex, column } = action.payload;
            const item = items[rowIndex];
            if (!item) return state;

            const BATCH_CYCLE_SEQUENCES = {
                over: ['O', ''],
                oi: ['IN', 'OUT'],
                lr: ['L', 'R']
            };
            const sequence = BATCH_CYCLE_SEQUENCES[column];
            if (!sequence) return state;

            const currentValue = item[column] || '';
            const currentIndex = sequence.indexOf(currentValue);
            const nextIndex = (currentIndex + 1) % sequence.length;
            const nextValue = sequence[nextIndex];

            items[rowIndex] = { ...item, [column]: nextValue };
            productData = { ...productData, items };
            return { ...state, products: { ...state.products, [productKey]: productData } };
        }

        case QUOTE_ACTION_TYPES.CYCLE_ITEM_TYPE:
        case QUOTE_ACTION_TYPES.SET_ITEM_TYPE:
        case QUOTE_ACTION_TYPES.BATCH_UPDATE_FABRIC_TYPE:
        case QUOTE_ACTION_TYPES.BATCH_UPDATE_FABRIC_TYPE_FOR_SELECTION: {
            items = [...productData.items];
            const TYPE_SEQUENCE = configManager.getFabricTypeSequence();
            if (TYPE_SEQUENCE.length === 0) return state;

            let changedIndexes = [];
            let newItems;

            if (action.type === QUOTE_ACTION_TYPES.CYCLE_ITEM_TYPE) {
                const { rowIndex } = action.payload;
                const item = items[rowIndex];
                if (item && (item.width || item.height)) {
                    const currentType = item.fabricType || TYPE_SEQUENCE[TYPE_SEQUENCE.length - 1];
                    const currentIndex = TYPE_SEQUENCE.indexOf(currentType);
                    const nextType = TYPE_SEQUENCE[(currentIndex + 1) % TYPE_SEQUENCE.length];
                    items[rowIndex] = { ...item, fabricType: nextType, linePrice: null, fabric: '', color: '' };
                    changedIndexes.push(rowIndex);
                }
                newItems = items;
            } else if (action.type === QUOTE_ACTION_TYPES.SET_ITEM_TYPE) {
                const { rowIndex, newType } = action.payload;
                if (items[rowIndex] && items[rowIndex].fabricType !== newType) {
                    items[rowIndex] = { ...items[rowIndex], fabricType: newType, linePrice: null, fabric: '', color: '' };
                    changedIndexes.push(rowIndex);
                }
                newItems = items;
            } else if (action.type === QUOTE_ACTION_TYPES.BATCH_UPDATE_FABRIC_TYPE) {
                let { newType } = action.payload;
                if (newType === undefined) { 
                    const firstItem = items.find(item => item.width && item.height);
                    const currentType = firstItem ? (firstItem.fabricType || TYPE_SEQUENCE[TYPE_SEQUENCE.length - 1]) : TYPE_SEQUENCE[TYPE_SEQUENCE.length - 1];
                    const currentIndex = TYPE_SEQUENCE.indexOf(currentType);
                    newType = TYPE_SEQUENCE[(currentIndex + 1) % TYPE_SEQUENCE.length];
                }
                newItems = items.map((item, index) => {
                    if (item.width && item.height && item.fabricType !== newType) {
                        changedIndexes.push(index);
                        return { ...item, fabricType: newType, linePrice: null, fabric: '', color: '' };
                    }
                    return item;
                });
            } else if (action.type === QUOTE_ACTION_TYPES.BATCH_UPDATE_FABRIC_TYPE_FOR_SELECTION) {
                const { selectedIndexes, newType } = action.payload;
                newItems = items.map((item, index) => {
                    if (selectedIndexes.includes(index) && item.width && item.height && item.fabricType !== newType) {
                        changedIndexes.push(index);
                        return { ...item, fabricType: newType, linePrice: null, fabric: '', color: '' };
                    }
                    return item;
                });
            }

            if (changedIndexes.length > 0) {
                const modifiedIndexes = new Set(state.uiMetadata.lfModifiedRowIndexes);
                changedIndexes.forEach(index => modifiedIndexes.delete(index));
                const newUiMetadata = { ...state.uiMetadata, lfModifiedRowIndexes: Array.from(modifiedIndexes) };
                productData = { ...productData, items: newItems };
                return { ...state, products: { ...state.products, [productKey]: productData }, uiMetadata: newUiMetadata };
            }
            return state;
        }

        case QUOTE_ACTION_TYPES.BATCH_UPDATE_LF_PROPERTIES: {
            const { rowIndexes, fabricName, fabricColor } = action.payload;
            items = productData.items.map((item, index) => {
                if (rowIndexes.includes(index)) {
                    return { ...item, fabric: fabricName, color: fabricColor };
                }
                return item;
            });
            productData = { ...productData, items };
            return { ...state, products: { ...state.products, [productKey]: productData } };
        }

        case QUOTE_ACTION_TYPES.REMOVE_LF_PROPERTIES: {
            const { rowIndexes } = action.payload;
            items = productData.items.map((item, index) => {
                if (rowIndexes.includes(index)) {
                    return { ...item, fabric: '', color: '' };
                }
                return item;
            });
            productData = { ...productData, items };
            return { ...state, products: { ...state.products, [productKey]: productData } };
        }

        case QUOTE_ACTION_TYPES.ADD_LF_MODIFIED_ROWS: {
            const modifiedIndexes = new Set([...state.uiMetadata.lfModifiedRowIndexes, ...action.payload.rowIndexes]);
            return { ...state, uiMetadata: { ...state.uiMetadata, lfModifiedRowIndexes: Array.from(modifiedIndexes) } };
        }

        case QUOTE_ACTION_TYPES.REMOVE_LF_MODIFIED_ROWS: {
            const indexesToRemove = new Set(action.payload.rowIndexes);
            const newModifiedIndexes = state.uiMetadata.lfModifiedRowIndexes.filter(i => !indexesToRemove.has(i));
            return { ...state, uiMetadata: { ...state.uiMetadata, lfModifiedRowIndexes: newModifiedIndexes } };
        }

        case QUOTE_ACTION_TYPES.UPDATE_ACCESSORY_SUMMARY: {
            const summary = productData.summary;
            const newAccessories = { ...summary.accessories, ...action.payload.data };
            const newSummary = { ...summary, accessories: newAccessories };
            productData = { ...productData, summary: newSummary };
            return { ...state, products: { ...state.products, [productKey]: productData } };
        }
        
        default:
            return state;
    }
}