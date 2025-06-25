import express from 'express';
import favicon from 'serve-favicon';
import cors from 'cors';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs/promises';
import { constants } from "fs";
import multer from 'multer';


const args = process.argv.slice(2); // Potong 2 yang pertama: 'node' dan path ke file
const debugMode = args.includes('--debug');
const { access } = fs;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 3000;
const app = express();
const router = express.Router({ mergeParams: true });
const upload = multer();
const importModule = async (modulename) => {
	if (debugMode) {
		const fullPath = new URL(`./apis/${modulename}.js`, import.meta.url).pathname;
		const mtime = (await fs.stat(fullPath)).mtimeMs;
		const freshUrl = `${fullPath}?v=${mtime}`;
		const module = await import(freshUrl);
		return module.default;	
	} else {
		return (await import(`./apis/${modulename}.js`)).default;
	}
}



router.use((req, res, next) => {
	if (req.is('multipart/form-data')) {
		upload.any()(req, res, next);
	} else {
		next();
	}
})

router.post('/upload', async (req, res, next) => {
	const modulename = req.params.modulename;
	const ModuleClass = await importModule(modulename)
	const module = new ModuleClass(req, res, next)
	try {
		const response = await module.handleRequest('upload', req.body)
		res.send(response)
	} catch (err) {
		next(err);
	}
});


app.use(cors());
app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", [
	path.join(__dirname, "views"),
	path.join(__dirname, "..", 'public', 'modules')
]);


app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/:modulename', router);


app.get('/', (req, res) => {
	res.render('index', {
		title: 'Fgta5js Development',
	});
})

app.get('/:modulename', async(req, res)=>{
	const modulename = req.params.modulename;
	const filename = path.join(__dirname, '..', 'public', 'modules', modulename, `${modulename}.html`)
	try {
		await access(filename, constants.F_OK);
		res.render('application', {
			modulename: modulename,
		});
	} catch {
		res.status(404).send("module tidak ditemukan.");
	}
})


app.post('/:modulename/:method', async (req, res, next)=>{
	const modulename = req.params.modulename;
	const ModuleClass = await importModule(modulename)
	const method = req.params.method;
	const module = new ModuleClass(req, res, next)
	try {
		const response = await module.handleRequest(method, req.body)
		res.send(response)
	} catch (err) {
		next(err);
	}
})

console.log(`Server is listening on port ${port}`);
app.listen(port);
