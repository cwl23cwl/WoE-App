/**
 * Global state for tracking text editing
 * Prevents focus loss when interacting with toolbar controls
 */

import React from 'react';

type EditingTextState = {
  editingTextId: string | null;
  setEditingTextId: (id: string | null) => void;
  isEditing: (id?: string) => boolean;
};

// Simple global state without external dependencies
let globalEditingTextId: string | null = null;
const subscribers: Array<() => void> = [];

export const editingTextStore = {
  getState: (): EditingTextState => ({
    editingTextId: globalEditingTextId,
    setEditingTextId: (id: string | null) => {
      console.log('🎯 Setting editing text ID:', { from: globalEditingTextId, to: id });
      globalEditingTextId = id;
      subscribers.forEach(callback => callback());
    },
    isEditing: (id?: string) => {
      if (id) {
        return globalEditingTextId === id;
      }
      return globalEditingTextId !== null;
    }
  }),

  subscribe: (callback: () => void) => {
    subscribers.push(callback);
    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }
};

// Hook for React components
export function useEditingTextStore() {
  const [, forceUpdate] = React.useState({});
  
  React.useEffect(() => {
    const unsubscribe = editingTextStore.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  return editingTextStore.getState();
}

// For non-React usage
export function getEditingTextId(): string | null {
  return globalEditingTextId;
}

export function setEditingTextId(id: string | null): void {
  editingTextStore.getState().setEditingTextId(id);
}

export function isEditingText(id?: string): boolean {
  return editingTextStore.getState().isEditing(id);
}