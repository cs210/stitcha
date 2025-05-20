import { createContext } from 'react';

export const LangContext = createContext<{
	lang: 'en' | 'pt-br';
	setLang: React.Dispatch<React.SetStateAction<'en' | 'pt-br'>>;
}>({
	lang: 'en',
	setLang: () => {},
});
