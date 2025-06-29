import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from './app-db.js'
import logger from './app-logger.js'
import test from 'node:test';




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router({ mergeParams: true });
const upload = multer();
const args = process.argv.slice(2); // Potong 2 yang pertama: 'node' dan path ke file
const debugMode = args.includes('--debug');

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


const handlePageError = (err, res, next) => {
	if (err.code === 'ENOENT') {
		res.status(404).send("module tidak ditemukan.");

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

const handleApiError = (err, res, next) => {
	const code = err.code ?? 500
	res.json({
		code: code,
		message: err.message
	})
}


router.use((req, res, next) => {
	if (req.is('multipart/form-data')) {
		upload.any()(req, res, next);
	} else {
		next();
	}
})


router.get('/', (req, res) => {
	req.session.user = {
		id: '234',
		name: 'agung',
	}

	res.render('index', {
		title: 'Fgta5js Development',
	});
})

router.get('/:modulename', async(req, res, next)=>{
	const modulename = req.params.modulename;
	const filename = path.join(__dirname, '..', 'public', 'modules', modulename, `${modulename}.html`)
	const fullUrlWithHostHeader = `${req.protocol}://${req.headers.host}${req.originalUrl}`;

	
	try {

		// TODO: cek dulu disini apakah user berhak mengakses halaman ini
		// UNAUTHORIZED: belum login
		// FORBIDDEN: sudah login, tapi tidak punya akses
	
		
		await fs.access(filename, fs.constants.F_OK);
		res.render('application', {
			modulename: modulename,
		});
		logger.access(req.session.user, modulename, fullUrlWithHostHeader)
	} catch(err) {
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
	const method = req.params.method;
	const module = new ModuleClass(req, res, next)
	try {
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