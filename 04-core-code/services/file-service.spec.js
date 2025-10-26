// File: 04-core-code/services/file-service.spec.js

import { FileService } from './file-service.js';
import { RollerBlindStrategy } from '../strategies/roller-blind-strategy.js';

describe('FileService', () => {
    let fileService;
    let mockProductFactory;

    beforeEach(() => {
        // Arrange: Mock the ProductFactory to return a real strategy instance,
        // as the parser depends on its getInitialItemData method.
        mockProductFactory = {
            getProductStrategy: jest.fn(() => new RollerBlindStrategy({ configManager: {} })),
        };

        fileService = new FileService({ productFactory: mockProductFactory });
    });

    describe('parseFileContent', () => {
        it('should correctly parse a valid JSON string', () => {
            // Arrange
            const mockQuoteData = {
                currentProduct: 'rollerBlind',
                products: { rollerBlind: { items: [{ width: 1000, height: 1000 }] } },
                uiMetadata: {},
            };
            const jsonString = JSON.stringify(mockQuoteData);

            // Act
            const result = fileService.parseFileContent('quote.json', jsonString);

            // Assert
            expect(result.success).toBe(true);
            expect(result.message).toContain('Successfully loaded data');
            expect(result.data).toEqual(mockQuoteData);
        });

        it('should correctly parse a valid CSV string and add an empty row', () => {
            // Arrange
            const csvString = 'sequence,Width,Height,Type,Price\n1,1200,1300,B1,75.00';
            
            // Act
            const result = fileService.parseFileContent('quote.csv', csvString);

            // Assert
            expect(result.success).toBe(true);
            const items = result.data.products.rollerBlind.items;
            expect(items).toHaveLength(2); // The parsed row + one new empty row
            expect(items[0].width).toBe(1200);
            expect(items[0].height).toBe(1300);
            expect(items[0].fabricType).toBe('B1');
            expect(items[1].width).toBeNull(); // The last row should be empty
        });

        it('should return an error for an unsupported file type', () => {
            // Arrange
            const textContent = 'some content';

            // Act
            const result = fileService.parseFileContent('quote.txt', textContent);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('Unsupported file type');
        });

        it('should add uiMetadata if it is missing from a loaded JSON file', () => {
            // Arrange
            const legacyQuoteData = {
                currentProduct: 'rollerBlind',
                products: { rollerBlind: { items: [{ width: 1000, height: 1000 }] } },
                // Missing uiMetadata property
            };
            const jsonString = JSON.stringify(legacyQuoteData);

            // Act
            const result = fileService.parseFileContent('quote.json', jsonString);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data.uiMetadata).toBeDefined();
            expect(result.data.uiMetadata).toEqual({ lfModifiedRowIndexes: [] });
        });
    });
});