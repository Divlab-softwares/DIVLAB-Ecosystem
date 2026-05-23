'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

const SearchContext = createContext({
    query: '',
    setQuery: (q: string) => { },
});

export const SearchProvider = ({ children }: { children: ReactNode }) => {
    const [query, setQuery] = useState('');
    return (
        <SearchContext.Provider value={{ query, setQuery }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => useContext(SearchContext);
