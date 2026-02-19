
// Mock logic from App.jsx handleZOrder
function testZOrder(items, selectedIds, action) {
    console.log(`--- Action: ${action} ---`);
    console.log('Selected:', selectedIds);
    console.log('Before:', items.map(i => i.id).join(', '));

    let newItems = [...items];
    const selectedIndices = newItems
        .map((item, index) => ({ id: item.id, index }))
        .filter(item => selectedIds.includes(item.id))
        .map(item => item.index)
        .sort((a, b) => a - b);

    if (selectedIndices.length === 0) return items;

    if (action === 'front') {
        const movingItems = selectedIndices.map(i => newItems[i]);
        for (let i = selectedIndices.length - 1; i >= 0; i--) {
            newItems.splice(selectedIndices[i], 1);
        }
        newItems.push(...movingItems);
    } else if (action === 'back') {
        const movingItems = selectedIndices.map(i => newItems[i]);
        for (let i = selectedIndices.length - 1; i >= 0; i--) {
            newItems.splice(selectedIndices[i], 1);
        }
        newItems.unshift(...movingItems);
    } else if (action === 'forward') {
        for (let i = selectedIndices.length - 1; i >= 0; i--) {
            const idx = selectedIndices[i];
            if (idx < newItems.length - 1) {
                const nextItem = newItems[idx + 1];
                if (!selectedIds.includes(nextItem.id)) {
                    [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
                }
            }
        }
    } else if (action === 'backward') {
        for (let i = 0; i < selectedIndices.length; i++) {
            const idx = selectedIndices[i];
            if (idx > 0) {
                const prevItem = newItems[idx - 1];
                if (!selectedIds.includes(prevItem.id)) {
                    [newItems[idx], newItems[idx - 1]] = [newItems[idx - 1], newItems[idx]];
                }
            }
        }
    }

    console.log('After: ', newItems.map(i => i.id).join(', '));
    return newItems;
}

const items = [
    { id: 'A', name: 'Stamp A' },
    { id: 'B', name: 'Stamp B' },
    { id: 'C', name: 'Stamp C' }
];

// Test 1: Move B to Front
testZOrder(items, ['B'], 'front');
// Expected: A, C, B

// Test 2: Move C to Back
testZOrder(items, ['C'], 'back');
// Expected: C, A, B

// Test 3: Move A Forward
testZOrder(items, ['A'], 'forward');
// Expected: B, A, C

// Test 4: Move B Backward
testZOrder(items, ['B'], 'backward');
// Expected: A, B, C (Wait, B is at index 1. Prev is A. Swap -> B, A, C? No. A, B, C start. B swap with A -> B, A, C) 
// Actually items is A, B, C.
// B (index 1). Prev A (index 0). Swap -> B, A, C. Correct.

// Test 5: Multiple Selection [A, B] to Front
testZOrder(items, ['A', 'B'], 'front');
// Expected: C, A, B (Order of A, B preserved?)

