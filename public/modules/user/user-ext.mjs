export function extendPage(self) {
	console.log('ini untuk extend pages')
}

export function initSearchParams(self, SearchParams) {
	// console.log(SearchParams)
	const cbo = SearchParams['searchgroup']
	cbo.setSelected('20', 'Operations')
}