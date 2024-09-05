import { configureStore, createSlice } from '@reduxjs/toolkit';

// Load state from localStorage
const loadState = () => {
    try {
        const serializedState = localStorage.getItem('store');
        if (serializedState === null) {
            return undefined;  // Return undefined if no state is found
        }
        return JSON.parse(serializedState);
    } catch (err) {
        console.error('Failed to load state:', err);
        return undefined;
    }
};

// Save state to localStorage
const saveState = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('store', serializedState);
    } catch (err) {
        console.error('Failed to save state:', err);
    }
};

const initialState = {
    blocks: [
        { id: 1, name: 'Task 1', stage: 'To Do', history: [] },
        { id: 2, name: 'Task 2', stage: 'In Progress', history: [] },
        { id: 3, name: 'Task 3', stage: 'Done', history: [] }
    ],
    stages: ['To Do', 'In Progress', 'Done'],
    filterText: '',
    selectedBlock: null,
    prompt: {
        show: false,
        blockId: null,
        newStage: '',
        additionalData: ''
    }
};

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        moveBlock: (state, action) => {
            const { blockId, newStage, additionalData } = action.payload;
            const block = state.blocks.find(b => b.id === blockId);

            if (block) {
                const allowedTransitions = {
                    'To Do': ['In Progress'],
                    'In Progress': ['Done', 'To Do'],
                    'Done': []
                };

                if (allowedTransitions[block.stage].includes(newStage)) {
                    block.stage = newStage;
                    block.history.push(`Moved to ${newStage} ${additionalData ? `with data: ${additionalData}` : ''}`);
                    state.prompt.show = false;  // Hide prompt after moving block
                    state.prompt.additionalData = '';
                }
            }
        },
        selectBlock: (state, action) => {
            state.selectedBlock = action.payload;
        },
        filterBlocks: (state, action) => {
            state.filterText = action.payload.toLowerCase();
        },
        addNote: (state, action) => {
            const { blockId, note } = action.payload;
            const block = state.blocks.find(b => b.id === blockId);

            if (block) {
                block.history.push(note);
            }
        },
        addBlock: (state, action) => {
            const newBlock = {
                id: state.blocks.length + 1,
                name: action.payload.name,
                stage: 'To Do',
                history: ['Created']
            };
            state.blocks.push(newBlock);
        },
        removeBlock: (state, action) => {
            state.blocks = state.blocks.filter(block => block.id !== action.payload);
            if (state.selectedBlock && state.selectedBlock.id === action.payload) {
                state.selectedBlock = null;
            }
        },
        showPrompt: (state, action) => {
            state.prompt = {
                show: true,
                blockId: action.payload.blockId,
                newStage: action.payload.newStage,
                additionalData: ''
            };
        },
        hidePrompt: (state) => {
            state.prompt.show = false;
            state.prompt.additionalData = '';
        },
        setAdditionalData: (state, action) => {
            state.prompt.additionalData = action.payload;
        }
    }
});

export const { moveBlock, selectBlock, filterBlocks, addNote, addBlock, removeBlock, showPrompt, hidePrompt, setAdditionalData } = taskSlice.actions;

// Create the store with the loaded state
const store = configureStore({
    reducer: taskSlice.reducer,
    preloadedState: loadState()  // Initialize with state from localStorage
});

// Subscribe to store changes and save state to localStorage
store.subscribe(() => {
    saveState(store.getState());
});

export { store };
