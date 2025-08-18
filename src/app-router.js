
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from './app-db.js'
import logger from './app-logger.js'
import session from 'express-session';


dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router({ mergeParams: true });
const upload = multer();
const args = process.argv.slice(2); // Potong 2 yang pertama: 'node' dan path ke file
const apiDebugMode = args.includes('--debug');
const fgta5jsDebugMode = process.env.DEBUG_MODE_FGTA5JS === 'true'
const fgta5jsVersion = process.env.FGTA5JS_VERSION || ''
const appDebugMode = process.env.DEBUG_MODE_APP === 'true'



const importModule = async (modulename) => {
	// jika mode debug, 
	// load api akan selalu dilakukan saat request (tanpa caching)
	if (apiDebugMode) {
		const fullPath = new URL(`./apis/${modulename}.js`, import.meta.url).pathname;
		const mtime = (await fs.stat(fullPath)).mtimeMs;
		const freshUrl = `${fullPath}?v=${mtime}`;
		const module = await import(freshUrl);
		return module.default;	
	} else {
		return (await import(`./apis/${modulename}.js`)).default;
	}
}

const kebabToCamel = (str) => {
  return str
    .split('-')
    .map((part, index) =>
      index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join('');
}


const handlePageError = (err, res, next) => {
	const modulename = err.Context.modulename

	if (err.code === 'ENOENT') {
		res.status(404).send(`module '${modulename}' tidak ditemukan.`);

	} else if (err.code==='UNAUTHORIZED') {
		// belum login, server tidak tahu user saat ini siapa
		res.status(401).send('Unauthorized access');

	} else if (err.code==='FORBIDDEN') {
		// sudah login, user tidak diperbolehkan akses
		res.status(403).send('Forbidden access, this incident will be reported');

	} else {
		// error lain-lain yang belum teridentifikasi
		res.status(500).send('error 500');
	}
}

const isFileExists = async (filepath) => {
	try {
		await fs.access(filepath);
		return true
	} catch (err) {
		return false
	}
}

const handleApiError = (err, res, next) => {
	const code = err.code ?? 500
	const response = {
		code: code,
		message: "API: " + err.message
	}
	
	if ([401, 403].includes(code)) {
		res.status(code).send(err.message)
	} else {
		res.json(response)
	}
}


router.use((req, res, next) => {
	if (req.is('multipart/form-data')) {
		upload.any()(req, res, next);
	} else {
		next();
	}
})


router.get('/', (req, res) => {

	// kedepannya set ini untuk keperluan login
	req.session.user = {
		userId: '234',
		userName: 'agung',
		userFullname: 'Agung Nugroho'
	}

	console.log(req.session)
	
	const sessionId = req.sessionID;
	console.log('Created Session ID:', sessionId);

	res.render('index', {
		title: 'Fgta5js Development',
	});
})

router.get('/:modulename', async(req, res, next)=>{
	const modulename = req.params.modulename;
	const fullUrlWithHostHeader = `${req.protocol}://${req.headers.host}${req.originalUrl}`;


	const ejsPath = path.join(__dirname, '..', 'public', 'modules', modulename, `${modulename}.ejs`)
	const cssPath = path.join(__dirname, '..', 'public', 'modules', modulename, `${modulename}.css`);
	
	const mjsFileName = appDebugMode ? `${modulename}.mjs` : `${modulename}.min.mjs`
	const mjsPath = path.join(__dirname, '..', 'public', 'modules', modulename, mjsFileName);


	const htmlExtenderFile = `${modulename}-ext.html`
	const htmlExtender = `${modulename}/${htmlExtenderFile}`
	const htmlExtenderPath = path.join(__dirname, '..', 'public', 'modules', modulename, htmlExtenderFile)


	const cssExists = await isFileExists(cssPath)
	const mjsExists = await isFileExists(mjsPath);
	const htmlExtenderExists = await isFileExists(htmlExtenderPath);



	try {
		// TODO: cek dulu disini apakah user berhak mengakses halaman ini
		// UNAUTHORIZED: belum login
		// FORBIDDEN: sudah login, tapi tidak punya akses


		// load halaman html-nya
		await fs.access(ejsPath, fs.constants.F_OK);
		res.render('application', {
			modulename: modulename,
			cssExists,
			mjsExists,
			mjsFileName,
			htmlExtenderExists,
			htmlExtender,
			fgta5jsDebugMode,
			fgta5jsVersion: fgta5jsVersion==='' ? '' : `-${fgta5jsVersion}`,
			appDebugMode
		});
		logger.access(req.session.user, modulename, fullUrlWithHostHeader)
	} catch(err) {
		err.Context = { modulename, ejsPath}
		handlePageError(err, res, next)
		logger.access(req.session.user, modulename, fullUrlWithHostHeader, err)
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


router.post('/:modulename/:method', async (req, res, next)=>{
	const modulename = req.params.modulename;
	const ModuleClass = await importModule(modulename)
	const method = kebabToCamel(req.params.method);
	
	try {
		const module = new ModuleClass(req, res, next)
		const result = await module.handleRequest(method, req.body)
		const response = {
			code: 0,
			result: result
		}
		res.json(response)
	} catch (err) {
		handleApiError(err, res, next)
	}
})

export default router