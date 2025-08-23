import dotenv from 'dotenv';
import sqlUtil from '@agung_dhewe/pgsqlc'
import { Worker } from 'worker_threads';

dotenv.config();


const args = process.argv.slice(2); // Buang 'node' dan path ke script
let generatorId;

args.forEach(arg => {
  if (arg.startsWith('--id=')) {
    generatorId = arg.split('=')[1];
  }
});

console.log('generator_id:', generatorId);
if (generatorId===undefined || generatorId===null || generatorId=='') {
	console.error('paremeter id untuk program yang digenerate belum diisi')
	process.exit(1)
}


const generator_id = generatorId
const workerTimeoutMs = 1 * 60 * 1000

await main(generator_id)

async function main(generator_id) {
	console.log('starting work..')
	try {
		const workerPath = './src/generator/worker.js'
		const worker = new Worker(workerPath, {
			workerData: {
				generator_id: generator_id
			}
		});

		// set worker timeout
		const timeoutId = setTimeout(() => {
			console.error('Worker timeout, terminating...');
			worker.terminate();
		}, workerTimeoutMs);

		worker.on('message', (info) => {
			clearTimeout(timeoutId);
			console.log(info.message);
			if (info.done===true) {
				worker.done = true
				worker.terminate()
			}
		});		

		worker.on('error', (err) => {
			clearTimeout(timeoutId);
			console.error(err);
			worker.terminate();
		});
		
		worker.on('exit', (code) => {
			clearTimeout(timeoutId);
			if (worker.done===true) {
				console.log('Worker finished.')
			} else {
				console.log(`Worker exited with code ${code}`);
		}
		});

	} catch (err) {
		console.error(err)
	}
}

