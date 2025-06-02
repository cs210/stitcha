const dictionaries = {
	'en': () => import('@/locales/en.json').then((module) => module.default),
	'pt-br': () => import('@/locales/pt-br.json').then((module) => module.default),
};

export const getDictionary = async (locale: 'en' | 'pt-br') => dictionaries[locale]();
