import { createContext } from 'react';

// Lang context for controlling the application's language
export const LangContext = createContext<{
	lang: 'en' | 'pt-br';
	setLang: React.Dispatch<React.SetStateAction<'en' | 'pt-br'>>;
}>({
	lang: 'en',
	setLang: () => {},
});
