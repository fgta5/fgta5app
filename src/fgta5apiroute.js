export async function Route(req, res, next) {
	const modulename = req.params.modulename;
	const ModuleClass = await import(`./apis/${modulename}.js`);

	const method = req.params.method;
	const module = new ModuleClass(req, res, next)
	try {
		res.send(`${modulename} ${method}`)
	} catch (err) {
		next(err);
	}
}