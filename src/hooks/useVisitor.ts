import { useState, useEffect } from 'react';
import type { Visitor } from '../types';

const VISITOR_KEY = 'emilys_galerie_visitor';

function generateVisitorId(): string {
  return 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function useVisitor() {
  const [visitor, setVisitor] = useState<Visitor | null>(null);

  useEffect(() => {
    // Try to load existing visitor from localStorage
    const stored = localStorage.getItem(VISITOR_KEY);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setVisitor({
          ...parsed,
          createdAt: new Date(parsed.createdAt)
        });
      } catch {
        // Invalid data, create new visitor
        createNewVisitor();
      }
    } else {
      createNewVisitor();
    }
  }, []);

  function createNewVisitor() {
    const newVisitor: Visitor = {
      id: generateVisitorId(),
      createdAt: new Date()
    };
    localStorage.setItem(VISITOR_KEY, JSON.stringify(newVisitor));
    setVisitor(newVisitor);
  }

  function setVisitorName(name: string) {
    if (!visitor) return;
    
    const updated: Visitor = {
      ...visitor,
      name
    };
    localStorage.setItem(VISITOR_KEY, JSON.stringify(updated));
    setVisitor(updated);
  }

  return { visitor, setVisitorName };
}
