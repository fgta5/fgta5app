const app = new $fgta5.Application('mainapp')
const urlDir = 'public/modules/group'
const Crsl = new $fgta5.SectionCarousell(app.Nodes.Main) 

export default {
	Source: 'group',
	app: app,
	urlDir: urlDir,
	Crsl: Crsl,
	Sections: { 
		groupHeaderList: 'groupHeaderList-section',
		groupHeaderEdit: 'groupHeaderEdit-section',
	}
}