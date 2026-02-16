import { useState } from 'react';

const useUndoRedo = (initialState) => {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initialState);
  const [future, setFuture] = useState([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const undo = () => {
    if (!canUndo) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture([present, ...future]);
    setPresent(previous);
  };

  const redo = () => {
    if (!canRedo) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast([...past, present]);
    setPresent(next);
    setFuture(newFuture);
  };

  const set = (newPresent) => {
    if (newPresent === present) return;

    setPast([...past, present]);
    setPresent(newPresent);
    setFuture([]);
  };

  const reset = (newInitialState) => {
    setPast([]);
    setPresent(newInitialState);
    setFuture([]);
  };

  return [present, set, undo, redo, canUndo, canRedo, reset];
};

export default useUndoRedo;
