const app = new $fgta5.Application('mainapp')
const urlDir = 'public/modules/user'
const Crsl = new $fgta5.SectionCarousell(app.Nodes.Main) 

export default {
	app: app,
	urlDir: urlDir,
	Crsl: Crsl,
	Sections: {
		userheaderList: 'userHeaderList-section',
		userheaderEdit: 'userHeaderEdit-section'
	}
}