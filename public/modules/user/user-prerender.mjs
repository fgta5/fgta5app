export async function prerender() {
	console.log('pre render')
	const obj_user_nickname = document.getElementById('obj_user_nickname')
	obj_user_nickname.setAttribute('description', 'ini diisi nickname')


	// tambahkan text
	const txt = document.createElement('span')
	txt.innerHTML = 'ini caption untuk checkbox'

	const c_user_email = document.getElementById('userHeaderEdit-obj_user_email-container')
	c_user_email.appendChild(txt)
}