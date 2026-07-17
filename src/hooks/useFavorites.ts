import { useState, useEffect } from "react";
import type { Quote } from "../models/quote";
import { storageRepository } from "../repositories/storageRepository";
import { STORAGE_KEYS } from "../config/constants";
import { logger } from "../services/loggerService";

let globalFavorites: Quote[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

// Initialize favorites on load
if (typeof window !== "undefined") {
  try {
    globalFavorites = storageRepository.getItem<Quote[]>(STORAGE_KEYS.FAVORITES, []);
  } catch (e) {
    logger.error("Failed to load favorites from repository:", e);
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Quote[]>(globalFavorites);

  useEffect(() => {
    const handleUpdate = () => {
      setFavorites([...globalFavorites]);
    };

    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const isFavorite = (quoteId: number) => {
    return favorites.some((q) => q.id === quoteId);
  };

  const toggleFavorite = (quote: Quote) => {
    const exists = globalFavorites.some((q) => q.id === quote.id);
    if (exists) {
      globalFavorites = globalFavorites.filter((q) => q.id !== quote.id);
    } else {
      globalFavorites = [...globalFavorites, quote];
    }

    try {
      storageRepository.setItem(STORAGE_KEYS.FAVORITES, globalFavorites);
    } catch (e) {
      logger.error("Failed to save favorites to repository:", e);
    }

    notify();
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  };
}
