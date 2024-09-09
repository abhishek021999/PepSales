import '../src/App.css';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    moveBlock, selectBlock, filterBlocks, addNote, addBlock,
    removeBlock, showPrompt, hidePrompt, setAdditionalData, updateBlock
} from './store';
import './App.css';  // Import the CSS file

const stageOrder = ['To Do', 'In Progress', 'Done'];

const App = () => {
    const dispatch = useDispatch();
    const { blocks, stages, filterText, selectedBlock, prompt } = useSelector(state => state);
    const [note, setNote] = useState('');
    const [newTaskName, setNewTaskName] = useState('');
    const [editTaskId, setEditTaskId] = useState(null);  // Track task being edited
    const [editTaskName, setEditTaskName] = useState('');  // Track the name being edited

    const handleDragStart = (blockId) => blockId;

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
        } else {
            alert("Task name cannot be empty.");
        }
    };

    const handleRemoveTask = (blockId) => {
        dispatch(removeBlock(blockId));
    };

    const handleEditTask = (block) => {
        setEditTaskId(block.id);
        setEditTaskName(block.name);  // Pre-fill the input with the current task name
    };

    const handleSaveEdit = () => {
        if (editTaskName.trim()) {
            dispatch(updateBlock({ blockId: editTaskId, newName: editTaskName }));
            setEditTaskId(null);
            setEditTaskName('');
        } else {
            alert("Task name cannot be empty.");
        }
    };

    const handleCancelEdit = () => {
        setEditTaskId(null);
        setEditTaskName('');
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

    const filteredBlocks = blocks
        .filter(block => block.name.toLowerCase().includes(filterText))
        .sort((a, b) => {
            const stageComparison = stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
            return stageComparison === 0 ? a.id - b.id : stageComparison;
        });

    return (
        <div className="app-container">
            <input
                type="text"
                placeholder="Search by name..."
                onChange={handleFilter}
                className="filter-input"
            />

            <div className="task-input">
                <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="New Task Name"
                />
                <button onClick={handleAddTask}>
                    Add Task
                </button>
            </div>

            <div className="stage-container">
                {stages.map(stage => (
                    <div
                        key={stage}
                        className="stage"
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
                                    className="block-item"
                                >
                                    {editTaskId === block.id ? (
                                        <div>
                                            <input
                                                type="text"
                                                value={editTaskName}
                                                onChange={(e) => setEditTaskName(e.target.value)}
                                            />
                                            <button onClick={handleSaveEdit}>Save</button>
                                            <button onClick={handleCancelEdit} className="cancel-btn">
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className='edit_remove'>
                                            {block.name}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditTask(block);
                                                }}
                                                className="edit-btn"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveTask(block.id);
                                                }}
                                                className="remove-btn"
                                            >
                                                X
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                ))}
            </div>

            {selectedBlock && (
                <div className="selected-block">
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
                        />
                        <button onClick={handleAddNote}>
                            Add Note
                        </button>
                    </div>
                </div>
            )}

            {prompt.show && (
                <div className="prompt-modal">
                    <h3>Additional Information</h3>
                    <p>Provide any additional data required for this transition:</p>
                    <input
                        type="text"
                        value={prompt.additionalData || ''}
                        onChange={handleAdditionalDataChange}
                        placeholder="Additional data..."
                    />
                    <button onClick={handlePromptSubmit} className="submit-btn">
                        Submit
                    </button>
                    <button onClick={handlePromptCancel} className="cancel-btn">
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;
