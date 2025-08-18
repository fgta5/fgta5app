import dotenv from 'dotenv';
import express from 'express';
import favicon from 'serve-favicon';
import cors from 'cors';
import * as path from 'node:path';
import session from './app-session.js'; // session
import router from './app-router.js'
import { fileURLToPath } from 'node:url';
import db from './app-db.js'
import logger from './app-logger.js'


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 3000;
const app = express();


app.set('trust proxy', true); // ini nanti diisi daftar host yang dipercaya sebagai proxy, baca dari env
app.set("view engine", "ejs");
app.set("views", [
	path.join(__dirname, "views"),
	path.join(__dirname, "..", 'public', 'modules')
]);


app.use(cors());
app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session);


app.locals.appConfig = {
  notifierHost: process.env.NOTIFIER_HOST || 'ws://localhost:8080'
};


// Middleware untuk mengecualikan file dengan ekstensi tertentu
app.use('/public', (req, res, next) => {
  const excludedExtensions = ['.ejs']; 
  const ext = path.extname(req.url);

  if (excludedExtensions.includes(ext)) {
    return res.status(403).send('Akses ke file ini tidak diperbolehkan');
  }

  next();
});

app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/', router)



const server = app.listen(port, ()=>{
	console.log(`Server is listening on port ${port}`);
});

// Tangani event 'error' pada objek server
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} sudah digunakan. Silakan coba port lain.`);
  } else {
    console.error('Terjadi kesalahan saat memulai server:', err);
  }
  // Anda bisa memutuskan untuk keluar dari aplikasi atau mencoba port lain
  process.exit(1); // Keluar dengan kode error
});
