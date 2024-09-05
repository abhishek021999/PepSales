import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { moveBlock, selectBlock, filterBlocks, addNote, addBlock, removeBlock, showPrompt, hidePrompt, setAdditionalData } from './store';

const stageOrder = ['To Do', 'In Progress', 'Done'];  // Define the order of stages

const App = () => {
    const dispatch = useDispatch();
    const { blocks, stages, filterText, selectedBlock, prompt } = useSelector(state => state);
    const [note, setNote] = useState('');
    const [newTaskName, setNewTaskName] = useState('');

    const handleDragStart = (blockId) => {
        return blockId;
    };

    const handleDrop = (e, newStage) => {
        const blockId = e.dataTransfer.getData('text');
        const block = blocks.find(b => b.id === parseInt(blockId));

        if (block) {
            const allowedTransitions = {
                'To Do': ['In Progress'],
                'In Progress': ['Done', 'To Do'],
                'Done': []
            };

            if (allowedTransitions[block.stage].includes(newStage)) {
                dispatch(showPrompt({ blockId: parseInt(blockId), newStage }));
            } else {
                alert(`Invalid transition from ${block.stage} to ${newStage}`);
            }
        }
    };

    const handleFilter = (e) => {
        dispatch(filterBlocks(e.target.value));
    };

    const handleAddNote = () => {
        if (selectedBlock) {
            dispatch(addNote({
                blockId: selectedBlock.id,
                note
            }));
            setNote('');
        }
    };

    const handleAddTask = () => {
        if (newTaskName.trim()) {
            dispatch(addBlock({ name: newTaskName }));
            setNewTaskName('');
        }
    };

    const handleRemoveTask = (blockId) => {
        dispatch(removeBlock(blockId));
    };

    const handlePromptSubmit = () => {
        dispatch(moveBlock({
            blockId: prompt.blockId,
            newStage: prompt.newStage,
            additionalData: prompt.additionalData
        }));
    };

    const handlePromptCancel = () => {
        dispatch(hidePrompt());
    };

    const handleAdditionalDataChange = (e) => {
        dispatch(setAdditionalData(e.target.value));
    };

    // Filter and sort blocks
    const filteredBlocks = blocks
        .filter(block => block.name.toLowerCase().includes(filterText))
        .sort((a, b) => {
            const stageComparison = stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
            if (stageComparison === 0) {
                return a.id - b.id;  // Optionally sort by ID if blocks are in the same stage
            }
            return stageComparison;
        });

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <input
                type="text"
                placeholder="Search by name..."
                onChange={handleFilter}
                style={{ marginBottom: '20px', padding: '5px' }}
            />

            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="New Task Name"
                    style={{ padding: '5px', marginRight: '10px' }}
                />
                <button onClick={handleAddTask} style={{ padding: '5px' }}>
                    Add Task
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {stages.map(stage => (
                    <div
                        key={stage}
                        style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: '#E5F0F1',
                            margin: '0 10px',
                            borderRadius: '5px'
                        }}
                        onDrop={(e) => handleDrop(e, stage)}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <h2>{stage}</h2>
                        {filteredBlocks
                            .filter(block => block.stage === stage)
                            .map(block => (
                                <div
                                    key={block.id}
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData('text', handleDragStart(block.id))}
                                    onClick={() => dispatch(selectBlock(block))}
                                    style={{
                                        padding: '10px',
                                        margin: '10px 0',
                                        backgroundColor: '#4A508E',
                                        color: 'white',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    {block.name}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();  // Prevent triggering onClick for block
                                            handleRemoveTask(block.id);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            backgroundColor: 'red',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                    </div>
                ))}
            </div>

            {selectedBlock && (
                <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#00DC82', color: 'white', borderRadius: '5px' }}>
                    <h3>{selectedBlock.name}</h3>
                    <p>Current Stage: {selectedBlock.stage}</p>
                    <h4>History:</h4>
                    <ul>
                        {selectedBlock.history.map((entry, index) => (
                            <li key={index}>{entry}</li>
                        ))}
                    </ul>
                    <div>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add a note..."
                            style={{ padding: '5px', marginTop: '10px' }}
                        />
                        <button onClick={handleAddNote} style={{ marginLeft: '10px', padding: '5px' }}>
                            Add Note
                        </button>
                    </div>
                </div>
            )}

            {prompt.show && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '5px',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
                }}>
                    <h3>Additional Information</h3>
                    <p>Provide any additional data required for this transition:</p>
                    <input
                        type="text"
                        value={prompt.additionalData}
                        onChange={handleAdditionalDataChange}
                        placeholder="Additional data..."
                        style={{ padding: '5px', width: '100%' }}
                    />
                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
                        <button onClick={handlePromptCancel} style={{ marginRight: '10px', padding: '5px' }}>
                            Cancel
                        </button>
                        <button onClick={handlePromptSubmit} style={{ padding: '5px' }}>
                            Submit
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
