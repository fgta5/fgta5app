const app = new $fgta5.Application('mainapp')
const urlDir = 'public/modules/{{moduleName}}'
const Crsl = new $fgta5.SectionCarousell(app.Nodes.Main) 

export default {
	Source: '{{moduleName}}',
	app: app,
	urlDir: urlDir,
	Crsl: Crsl,
	Sections: { {{#each sections}}
		{{sectionName}}: '{{sectionElementId}}',{{/each}}
	}
}