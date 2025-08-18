import { workerData, parentPort } from 'worker_threads';

const { jobId, generator_id } = workerData;

setTimeout(() => {
	console.log('proses selesai')		
	parentPort.postMessage('Proses selesai!');
}, 10000);
