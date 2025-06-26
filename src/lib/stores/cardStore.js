// Central store for managing the greeting card state with full spread support
import { derived, writable } from 'svelte/store';

// A function to generate unique IDs for new elements
const generateId = () => `el_${Math.random().toString(36).substr(2, 9)}`;

// Predefined card sizes (in pixels, based on 96 DPI)
export const CARD_SIZES = {
  'standard': { name: 'Standard (5.5" × 11")', width: 528, height: 792 }, // 5.5 x 11 inches at 96 DPI
  'small': { name: 'Small (4" × 6")', width: 384, height: 576 },
  'large': { name: 'Large (8.5" × 11")', width: 816, height: 1056 }
};

// Common greeting phrases that grandma would love
export const GREETING_PHRASES = {
  birthday: [
    "Happy Birthday!",
    "Wishing you joy!",
    "Another year of blessings!",
    "May your day be special!",
    "Celebrating you today!"
  ],
  holiday: [
    "Season's Greetings!",
    "Merry Christmas!",
    "Happy Holidays!",
    "Peace and Joy!",
    "Warm wishes to you!"
  ],
  thankyou: [
    "Thank you so much!",
    "Grateful for you!",
    "With heartfelt thanks!",
    "You're wonderful!",
    "Much appreciated!"
  ],
  love: [
    "With love,",
    "Thinking of you!",
    "You're in my heart!",
    "Sending hugs!",
    "Love always!"
  ],
  getwell: [
    "Get well soon!",
    "Healing thoughts!",
    "Feel better!",
    "Rest and recover!",
    "Sending wellness!"
  ]
};

// Font families available to grandma
export const FONT_FAMILIES = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' }
];

// Text alignment options
export const TEXT_ALIGNMENTS = [
  { name: 'Left', value: 'left', icon: '⬅️' },
  { name: 'Center', value: 'center', icon: '↔️' },
  { name: 'Right', value: 'right', icon: '➡️' }
];

// Initial empty side structure
const createEmptySide = () => ({
  backgroundColor: '#FFFFFF',
  textElements: [],  // Example: { id: '...', content: 'Hello!', x: 50, y: 50, fontSize: 24, color: '#000', fontFamily: 'Arial' }
  imageElements: [], // Example: { id: '...', src: '...', x: 150, y: 100, width: 200, height: 150, scale: 1 }
  stickerElements: [] // Example: { id: '...', src: '...', x: 200, y: 200, width: 80, height: 80 }
});

// Valid card sides
export const CARD_SIDES = ['front', 'inside-left', 'inside-right', 'back'];

// Initial card state with all sides always available
const initialCardState = {
  cardSize: CARD_SIZES.standard, // Default to 5.5 x 11
  currentSide: 'front',
  selectedElements: [],
  clipboard: null,
  snapToGrid: false,
  gridSize: 20,
  showGuides: false,
  placementMode: false,
  selectedSticker: null,
  
  front: {
    backgroundColor: '#ffffff',
    elements: {}
  },
  'inside-left': {
    backgroundColor: '#ffffff',
    elements: {}
  },
  'inside-right': {
    backgroundColor: '#ffffff',
    elements: {}
  },
  back: {
    backgroundColor: '#ffffff',
    elements: {
      'signature-text': {
        id: 'signature-text',
        type: 'text',
        x: 20,
        y: 750, // Near bottom for 5.5 x 11 card
        width: 488, // Full width minus margins
        height: 30,
        content: 'Designed in Grandma\'s Card Shop',
        fontSize: '14px',
        fontFamily: 'Georgia',
        color: '#666666',
        textAlign: 'center',
        fontWeight: 'normal',
        zIndex: 1
      }
    }
  }
};

export const cardState = writable(initialCardState);

// History for undo/redo functionality
const MAX_HISTORY = 20;
export const cardHistory = writable({
  past: [],
  present: null,
  future: []
});

// Initialize history with current state
cardState.subscribe(state => {
  cardHistory.update(history => {
    if (history.present === null) {
      return {
        ...history,
        present: JSON.parse(JSON.stringify(state))
      };
    }
    return history;
  });
});

// Derived store for current side data
export const currentSideData = derived(
  cardState,
  $cardState => $cardState[$cardState.currentSide]
);

// Derived store for spread view (inside-left and inside-right together)
export const insideSpreadData = derived(
  cardState,
  $cardState => ({
    left: $cardState['inside-left'],
    right: $cardState['inside-right']
  })
);

// Helper function to save state to history
function saveToHistory() {
  cardState.update(state => {
    cardHistory.update(history => {
      const newPast = [...history.past, history.present].slice(-MAX_HISTORY);
      return {
        past: newPast,
        present: JSON.parse(JSON.stringify(state)),
        future: []
      };
    });
    return state;
  });
}

// Undo/Redo functions
export function undo() {
  cardHistory.update(history => {
    if (history.past.length === 0) return history;
    
    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);
    
    cardState.set(previous);
    
    return {
      past: newPast,
      present: previous,
      future: [history.present, ...history.future]
    };
  });
}

export function redo() {
  cardHistory.update(history => {
    if (history.future.length === 0) return history;
    
    const next = history.future[0];
    const newFuture = history.future.slice(1);
    
    cardState.set(next);
    
    return {
      past: [...history.past, history.present],
      present: next,
      future: newFuture
    };
  });
}

// Helper functions for card management
export function switchToSide(side) {
  if (!CARD_SIDES.includes(side)) return;
  
  cardState.update(state => ({
    ...state,
    currentSide: side,
    selectedElements: [] // Clear selection when switching sides
  }));
}

export function setCardSize(sizeKey) {
  if (!CARD_SIZES[sizeKey]) return;
  
  saveToHistory();
  cardState.update(state => ({
    ...state,
    cardSize: CARD_SIZES[sizeKey]
  }));
}

export function setCustomCardSize(width, height) {
  saveToHistory();
  cardState.update(state => ({
    ...state,
    cardSize: { name: 'Custom', width, height }
  }));
}

export function setBackgroundColor(color, side = null) {
  saveToHistory();
  cardState.update(state => {
    const targetSide = side || state.currentSide;
    return {
      ...state,
      [targetSide]: {
        ...state[targetSide],
        backgroundColor: color
      }
    };
  });
}

// Grid and guide functions
export function toggleSnapToGrid() {
  cardState.update(state => ({
    ...state,
    snapToGrid: !state.snapToGrid
  }));
}

export function setGridSize(size) {
  cardState.update(state => ({
    ...state,
    gridSize: Math.max(5, Math.min(50, size))
  }));
}

export function toggleGuides() {
  cardState.update(state => ({
    ...state,
    showGuides: !state.showGuides
  }));
}

// Helper function to snap coordinates to grid
function snapToGrid(value, gridSize, enabled) {
  if (!enabled) return value;
  return Math.round(value / gridSize) * gridSize;
}

// Selection functions
export function selectElement(elementType, elementId, multiSelect = false) {
  cardState.update(state => {
    const elementKey = `${elementType}:${elementId}`;
    let newSelection;
    
    if (multiSelect) {
      if (state.selectedElements.includes(elementKey)) {
        newSelection = state.selectedElements.filter(id => id !== elementKey);
      } else {
        newSelection = [...state.selectedElements, elementKey];
      }
    } else {
      newSelection = [elementKey];
    }
    
    return {
      ...state,
      selectedElements: newSelection
    };
  });
}

export function clearSelection() {
  cardState.update(state => ({
    ...state,
    selectedElements: []
  }));
}

export function selectAllElements() {
  cardState.update(state => {
    const currentSideData = state[state.currentSide];
    const allElements = [];
    
    // Add all elements from current side
    currentSideData.textElements.forEach(el => allElements.push(`textElements:${el.id}`));
    currentSideData.imageElements.forEach(el => allElements.push(`imageElements:${el.id}`));
    currentSideData.stickerElements.forEach(el => allElements.push(`stickerElements:${el.id}`));
    
    return {
      ...state,
      selectedElements: allElements
    };
  });
}

// Copy/Paste functions
export function copySelectedElements() {
  cardState.update(state => {
    const currentSideData = state[state.currentSide];
    const elementsToCopy = [];
    
    state.selectedElements.forEach(elementKey => {
      const [elementType, elementId] = elementKey.split(':');
      const element = currentSideData[elementType]?.find(el => el.id === elementId);
      if (element) {
        elementsToCopy.push({ type: elementType.replace('Elements', ''), element });
      }
    });
    
    return {
      ...state,
      clipboard: elementsToCopy.length > 0 ? elementsToCopy : null
    };
  });
}

export function pasteElements() {
  cardState.update(state => {
    if (!state.clipboard) return state;
    
    saveToHistory();
    const targetSide = state.currentSide;
    const newState = { ...state };
    
    state.clipboard.forEach(({ type, element }) => {
      const newElement = {
        ...element,
        id: generateId(),
        x: element.x + 20, // Offset pasted elements
        y: element.y + 20
      };
      
      const elementType = type + 'Elements';
      newState[targetSide][elementType] = [...newState[targetSide][elementType], newElement];
    });
    
    return newState;
  });
}

// Alignment functions
export function alignElements(alignment) {
  cardState.update(state => {
    if (state.selectedElements.length < 2) return state;
    
    saveToHistory();
    const currentSideData = state[state.currentSide];
    const elements = [];
    
    // Gather all selected elements
    state.selectedElements.forEach(elementKey => {
      const [elementType, elementId] = elementKey.split(':');
      const element = currentSideData[elementType]?.find(el => el.id === elementId);
      if (element) {
        elements.push({ type: elementType, element });
      }
    });
    
    if (elements.length < 2) return state;
    
    // Calculate alignment values
    let alignValue;
    switch (alignment) {
      case 'left':
        alignValue = Math.min(...elements.map(({ element }) => element.x));
        break;
      case 'right':
        alignValue = Math.max(...elements.map(({ element }) => element.x + (element.width || 0)));
        break;
      case 'top':
        alignValue = Math.min(...elements.map(({ element }) => element.y));
        break;
      case 'bottom':
        alignValue = Math.max(...elements.map(({ element }) => element.y + (element.height || 0)));
        break;
      case 'center-horizontal':
        const centerX = elements.reduce((sum, { element }) => sum + element.x + (element.width || 0) / 2, 0) / elements.length;
        alignValue = centerX;
        break;
      case 'center-vertical':
        const centerY = elements.reduce((sum, { element }) => sum + element.y + (element.height || 0) / 2, 0) / elements.length;
        alignValue = centerY;
        break;
    }
    
    // Apply alignment
    const newState = { ...state };
    elements.forEach(({ type, element }) => {
      const elementArray = newState[state.currentSide][type];
      const elementIndex = elementArray.findIndex(el => el.id === element.id);
      
      if (elementIndex !== -1) {
        let newX = element.x;
        let newY = element.y;
        
        switch (alignment) {
          case 'left':
            newX = alignValue;
            break;
          case 'right':
            newX = alignValue - (element.width || 0);
            break;
          case 'top':
            newY = alignValue;
            break;
          case 'bottom':
            newY = alignValue - (element.height || 0);
            break;
          case 'center-horizontal':
            newX = alignValue - (element.width || 0) / 2;
            break;
          case 'center-vertical':
            newY = alignValue - (element.height || 0) / 2;
            break;
        }
        
        elementArray[elementIndex] = { ...element, x: newX, y: newY };
      }
    });
    
    return newState;
  });
}

// Layer functions
export function bringToFront(elementType, elementId) {
  cardState.update(state => {
    saveToHistory();
    const targetSide = state.currentSide;
    const elements = [...state[targetSide][elementType]];
    const elementIndex = elements.findIndex(el => el.id === elementId);
    
    if (elementIndex !== -1) {
      const element = elements.splice(elementIndex, 1)[0];
      elements.push(element);
      
      return {
        ...state,
        [targetSide]: {
          ...state[targetSide],
          [elementType]: elements
        }
      };
    }
    
    return state;
  });
}

export function sendToBack(elementType, elementId) {
  cardState.update(state => {
    saveToHistory();
    const targetSide = state.currentSide;
    const elements = [...state[targetSide][elementType]];
    const elementIndex = elements.findIndex(el => el.id === elementId);
    
    if (elementIndex !== -1) {
      const element = elements.splice(elementIndex, 1)[0];
      elements.unshift(element);
      
      return {
        ...state,
        [targetSide]: {
          ...state[targetSide],
          [elementType]: elements
        }
      };
    }
    
    return state;
  });
}

// Sticker selection and placement functions
export function selectSticker(emoji) {
  // Convert emoji to image data URL
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 100;
  canvas.height = 100;
  ctx.font = '80px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 50, 50);
  
  const dataURL = canvas.toDataURL();
  
  cardState.update(state => ({
    ...state,
    selectedSticker: { emoji, dataURL },
    placementMode: true
  }));
}

export function placeStickerAt(x, y, width = 80, height = 80, side = null) {
  cardState.update(state => {
    if (!state.selectedSticker) return state;
    
    saveToHistory();
    const targetSide = side || state.currentSide;
    
    // Snap to grid if enabled
    const snappedX = snapToGrid(Math.max(0, x - width / 2), state.gridSize, state.snapToGrid);
    const snappedY = snapToGrid(Math.max(0, y - height / 2), state.gridSize, state.snapToGrid);
    
    const newSticker = {
      id: generateId(),
      src: state.selectedSticker.dataURL,
      x: snappedX,
      y: snappedY,
      width,
      height,
      rotation: 0,
      emoji: state.selectedSticker.emoji
    };
    
    return {
      ...state,
      [targetSide]: {
        ...state[targetSide],
        stickerElements: [...state[targetSide].stickerElements, newSticker]
      },
      selectedSticker: null,
      placementMode: false
    };
  });
}

export function cancelStickerPlacement() {
  cardState.update(state => ({
    ...state,
    selectedSticker: null,
    placementMode: false
  }));
}

// Helper functions for managing elements (updated to work with all sides)
export function addTextElement(content = 'Double-click to edit', side = null) {
  saveToHistory();
  cardState.update(state => {
    const targetSide = side || state.currentSide;
    
    // Snap to grid if enabled
    const snappedX = snapToGrid(100, state.gridSize, state.snapToGrid);
    const snappedY = snapToGrid(100, state.gridSize, state.snapToGrid);
    
    return {
      ...state,
      [targetSide]: {
        ...state[targetSide],
        textElements: [...state[targetSide].textElements, {
          id: generateId(),
          content,
          x: snappedX,
          y: snappedY,
          fontSize: 24,
          color: '#000000',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'normal',
          textAlign: 'left'
        }]
      }
    };
  });
}

export function addGreetingPhrase(category) {
  const phrases = GREETING_PHRASES[category] || [];
  if (phrases.length === 0) return;
  
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  addTextElement(randomPhrase);
}

export function addImageElement(src, width = 200, height = 150, side = null) {
  saveToHistory();
  cardState.update(state => {
    const targetSide = side || state.currentSide;
    
    // Snap to grid if enabled
    const snappedX = snapToGrid(150, state.gridSize, state.snapToGrid);
    const snappedY = snapToGrid(100, state.gridSize, state.snapToGrid);
    
    return {
      ...state,
      [targetSide]: {
        ...state[targetSide],
        imageElements: [...state[targetSide].imageElements, {
          id: generateId(),
          src,
          x: snappedX,
          y: snappedY,
          width,
          height,
          scale: 1,
          rotation: 0
        }]
      }
    };
  });
}

export function addStickerElement(src, width = 80, height = 80, side = null) {
  saveToHistory();
  cardState.update(state => {
    const targetSide = side || state.currentSide;
    
    // Snap to grid if enabled
    const snappedX = snapToGrid(200, state.gridSize, state.snapToGrid);
    const snappedY = snapToGrid(200, state.gridSize, state.snapToGrid);
    
    return {
      ...state,
      [targetSide]: {
        ...state[targetSide],
        stickerElements: [...state[targetSide].stickerElements, {
          id: generateId(),
          src,
          x: snappedX,
          y: snappedY,
          width,
          height,
          rotation: 0
        }]
      }
    };
  });
}

export function updateElement(elementType, elementId, updates, side = null) {
  cardState.update(state => {
    const targetSide = side || state.currentSide;
    
    // Apply grid snapping to position updates
    if (updates.x !== undefined && state.snapToGrid) {
      updates.x = snapToGrid(updates.x, state.gridSize, true);
    }
    if (updates.y !== undefined && state.snapToGrid) {
      updates.y = snapToGrid(updates.y, state.gridSize, true);
    }
    
    return {
      ...state,
      [targetSide]: {
        ...state[targetSide],
        [elementType]: state[targetSide][elementType].map(element => 
          element.id === elementId ? { ...element, ...updates } : element
        )
      }
    };
  });
}

export function deleteElement(elementType, elementId, side = null) {
  saveToHistory();
  cardState.update(state => {
    const targetSide = side || state.currentSide;
    
    // Remove from selection if selected
    const elementKey = `${elementType}:${elementId}`;
    const newSelectedElements = state.selectedElements.filter(id => id !== elementKey);
    
    return {
      ...state,
      selectedElements: newSelectedElements,
      [targetSide]: {
        ...state[targetSide],
        [elementType]: state[targetSide][elementType].filter(element => element.id !== elementId)
      }
    };
  });
}

export function deleteSelectedElements() {
  cardState.update(state => {
    if (state.selectedElements.length === 0) return state;
    
    saveToHistory();
    const targetSide = state.currentSide;
    const newState = { ...state };
    
    state.selectedElements.forEach(elementKey => {
      const [elementType, elementId] = elementKey.split(':');
      newState[targetSide][elementType] = newState[targetSide][elementType].filter(
        element => element.id !== elementId
      );
    });
    
    return {
      ...newState,
      selectedElements: []
    };
  });
}

export function clearCard(side = null) {
  saveToHistory();
  cardState.update(state => {
    if (side && CARD_SIDES.includes(side)) {
      // Clear specific side
      return {
        ...state,
        selectedElements: [],
        [side]: createEmptySide()
      };
    } else {
      // Clear all sides
      return {
        ...state,
        selectedElements: [],
        front: createEmptySide(),
        'inside-left': createEmptySide(),
        'inside-right': createEmptySide(),
        back: createEmptySide()
      };
    }
  });
}

export function duplicateToOtherSide(targetSide = null) {
  saveToHistory();
  cardState.update(state => {
    const currentSide = state.currentSide;
    let otherSide = targetSide;
    
    if (!otherSide) {
      // Auto-determine other side
      if (currentSide === 'front') otherSide = 'inside-left';
      else if (currentSide === 'inside-left') otherSide = 'inside-right';
      else if (currentSide === 'inside-right') otherSide = 'inside-left';
      else if (currentSide === 'back') otherSide = 'front';
      else otherSide = 'front';
    }
    
    // Deep copy current side to other side with new IDs
    const duplicatedSide = {
      backgroundColor: state[currentSide].backgroundColor,
      textElements: state[currentSide].textElements.map(el => ({ ...el, id: generateId() })),
      imageElements: state[currentSide].imageElements.map(el => ({ ...el, id: generateId() })),
      stickerElements: state[currentSide].stickerElements.map(el => ({ ...el, id: generateId() }))
    };
    
    return {
      ...state,
      [otherSide]: duplicatedSide
    };
  });
}

// Template functions for grandma
export function applyTemplate(templateName) {
  saveToHistory();
  
  const templates = {
    birthday: {
      front: {
        backgroundColor: '#FFE4E6',
        textElements: [
          { id: generateId(), content: 'Happy Birthday!', x: 200, y: 100, fontSize: 36, color: '#DC2626', fontFamily: 'serif', fontWeight: 'bold', textAlign: 'center' }
        ],
        imageElements: [],
        stickerElements: []
      }
    },
    thankyou: {
      front: {
        backgroundColor: '#F0F9FF',
        textElements: [
          { id: generateId(), content: 'Thank You!', x: 200, y: 150, fontSize: 32, color: '#1E40AF', fontFamily: 'serif', fontWeight: 'bold', textAlign: 'center' }
        ],
        imageElements: [],
        stickerElements: []
      }
    }
  };
  
  const template = templates[templateName];
  if (!template) return;
  
  cardState.update(state => ({
    ...state,
    selectedElements: [],
    ...template
  }));
}

export { generateId };

