// Tiny event bus for cross-screen updates without extra deps
const listeners = {};

export const on = (eventName, handler) => {
  if (!listeners[eventName]) listeners[eventName] = new Set();
  listeners[eventName].add(handler);
  // Return unsubscribe
  return () => {
    listeners[eventName]?.delete(handler);
  };
};

export const emit = (eventName, payload) => {
  if (!listeners[eventName]) return;
  for (const handler of listeners[eventName]) {
    try {
      handler(payload);
    } catch (e) {
      // Avoid breaking other listeners
      console.warn('eventBus handler error for', eventName, e);
    }
  }
};

export default { on, emit };


