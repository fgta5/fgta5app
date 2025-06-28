import Api from './../api.js'

// api: account
export default class extends Api {
	constructor(req, res, next) {
		super(req, res, next);
	}

	async list(body) {
		return await list(this, body)
	}

	async upload(body) {
		// console.log(body)
		return {
			hasil: "agung nugroho"
		}
	}

}


async function list(self, body) {
	const { searchtext='', limit=0, offset=0, sort={} } = body
	const userSort = sort ?? {}

	var rawdata
	if (searchtext!='' && searchtext!=null) {
 		rawdata = data.persons.filter(person => person.nama.toLowerCase().includes(searchtext));
	} else {
		rawdata = data.persons
	}

	var hasil = [...rawdata]
	if (Object.keys(userSort).length>0) {
		dynamicSort(hasil, userSort)
	} 


	var start = offset ?? 0
	var max_rows = limit=='' || limit==0 || limit=='0' || limit==null ? 10 : limit

	var result = {searchtext: searchtext, limit: max_rows, nextoffset: null, data:[]}
	var i
	for (i=start; i<start+max_rows; i++) {
		var person = hasil[i]
		if (person==null) {
			break
		}

		result.data.push(person)
	}
	
	var nextoffset = i
	if (hasil[nextoffset]!=null) {
		result.nextoffset = nextoffset
	}

	return result
}


function dynamicSort(data, criteria) {
    return data.sort((a, b) => {
        for (const key of Object.keys(criteria)) {
            const order = criteria[key] === 'asc' ? 1 : -1;
            const valueA = a[key];
            const valueB = b[key];

            let compare;
            if (typeof valueA === "number" && typeof valueB === "number") {
                // Jika kedua nilai angka, gunakan perbandingan numerik
                compare = (valueA - valueB) * order;
            } else {
                // Jika bukan angka, anggap sebagai string dan gunakan localeCompare
                compare = String(valueA).localeCompare(String(valueB)) * order;
            }

            if (compare !== 0) return compare; // Prioritaskan field dengan perbedaan
        }
        return 0; // Jika semua field sama, tidak mengubah urutan
    });
};


const persons = [
	{nama:'agung nugroho', alamat:'taman royal', kota:'tangerang', phone:'123'},
	{nama:'nugroho', alamat:'citra indah', kota:'cibubur', phone:'456'},
	{nama:'dwi', alamat:'jl pramuka', kota:'jakarta', phone:'789'},
	{nama:'wibowo', alamat:'jl pantirejo', kota:'salatiga', phone:'101'},
	{nama:'rahmat', alamat:'jl merdeka', kota:'bandung', phone:'102'},
	{nama:'susan', alamat:'jl kemuning', kota:'semarang', phone:'103'},
	{nama:'yusuf', alamat:'jl sejati', kota:'makassar', phone:'104'},
	{nama:'mira', alamat:'jl kencana', kota:'surabaya', phone:'105'},
	{nama:'hendri', alamat:'jl sutera', kota:'medan', phone:'106'},
	{nama:'toni', alamat:'jl cempaka', kota:'denpasar', phone:'107'},
	{nama:'rini', alamat:'jl flamboyan', kota:'palembang', phone:'108'},
	{nama:'fadli', alamat:'jl anggrek', kota:'yogyakarta', phone:'109'},
	{nama:'rudi', alamat:'jl mawar', kota:'bandar lampung', phone:'110'},
	{nama:'cindy', alamat:'jl melati', kota:'padang', phone:'111'},
	{nama:'bambang', alamat:'jl tulip', kota:'balikpapan', phone:'112'},
	{nama:'dea', alamat:'jl bougenville', kota:'pontianak', phone:'113'},
	{nama:'eko nugroho', alamat:'jl teratai', kota:'bogor', phone:'114'},
	{nama:'lina', alamat:'jl cemara', kota:'batam', phone:'115'},
	{nama:'fitri', alamat:'jl pinus', kota:'pekanbaru', phone:'116'},
	{nama:'roni', alamat:'jl jati', kota:'malang', phone:'117'},
	{nama:'gina', alamat:'jl akasia', kota:'solo', phone:'118'},
	{nama:'ferdi', alamat:'jl kenari', kota:'serang', phone:'119'},
	{nama:'dian', alamat:'jl wisteria', kota:'cilegon', phone:'120'},
	{nama:'satria', alamat:'jl salak', kota:'purwokerto', phone:'121'},
	{nama:'ahmad hadi', alamat:'jl mangga', kota:'garut', phone:'122'},
	{nama:'irma', alamat:'jl pepaya', kota:'tasikmalaya', phone:'123'},
	{nama:'donny', alamat:'jl duren', kota:'cianjur', phone:'124'},
	{nama:'vera', alamat:'jl rambutan', kota:'purwakarta', phone:'125'},
	{nama:'agus', alamat:'jl nangka', kota:'depok', phone:'126'},
	{nama:'wati', alamat:'jl apel', kota:'bekasi', phone:'127'},
	{nama:'budi', alamat:'jl pisang', kota:'sukabumi', phone:'128'},
	{nama:'sari', alamat:'jl kelapa', kota:'karawang', phone:'129'},
	{nama:'fajar', alamat:'jl durian', kota:'probolinggo', phone:'130'},
	{nama:'lilis', alamat:'jl stroberi', kota:'jember', phone:'131'},
	{nama:'taufik', alamat:'jl sirsak', kota:'nganjuk', phone:'132'},
	{nama:'amelia', alamat:'jl alpukat', kota:'madiun', phone:'133'},
	{nama:'rizki', alamat:'jl ceri', kota:'kediri', phone:'134'},
	{nama:'michael', alamat:'jl cherry', kota:'pacitan', phone:'135'},
	{nama:'ricky', alamat:'jl plum', kota:'magelang', phone:'136'},
	{nama:'nina', alamat:'jl kiwi', kota:'blitar', phone:'137'},
	{nama:'hendra', alamat:'jl lemon', kota:'pati', phone:'138'},
	{nama:'elisa', alamat:'jl jeruk', kota:'cilacap', phone:'139'},
	{nama:'kiki', alamat:'jl bengkoang', kota:'lampung', phone:'140'},
	{nama:'lukman', alamat:'jl terong', kota:'banjarmasin', phone:'141'},
	{nama:'adi', alamat:'jl labu', kota:'samarinda', phone:'142'},
	{nama:'mario', alamat:'jl sawo', kota:'palangkaraya', phone:'143'},
	{nama:'fitria', alamat:'jl cendana', kota:'kupang', phone:'144'},
	{nama:'ferdy', alamat:'jl mahoni', kota:'ternate', phone:'145'},
	{nama:'karina', alamat:'jl sengon', kota:'ambon', phone:'146'},
	{nama:'yoga', alamat:'jl kayu manis', kota:'jayapura', phone:'147'},
	{nama:'anita', alamat:'jl sonokeling', kota:'manado', phone:'148'},
	{nama:'arief', alamat:'jl waru', kota:'gorontalo', phone:'149'},
	{nama:'ahmad reza', alamat:'jl meranti', kota:'kendari', phone:'150'},
	{nama:'farhan', alamat:'jl beringin', kota:'jambi', phone:'151'},
	{nama:'siti', alamat:'jl mahkota', kota:'medan', phone:'152'},
	{nama:'arief', alamat:'jl elang', kota:'bogor', phone:'153'},
	{nama:'sandra', alamat:'jl pesona', kota:'palembang', phone:'154'},
	{nama:'wilson', alamat:'jl cendrawasih', kota:'malang', phone:'155'},
	{nama:'agus', alamat:'jl padma', kota:'yogyakarta', phone:'156'},
	{nama:'bella', alamat:'jl intan', kota:'bandung', phone:'157'},
	{nama:'dion', alamat:'jl batu', kota:'cirebon', phone:'158'},
	{nama:'restu', alamat:'jl permai', kota:'pekanbaru', phone:'159'},
	{nama:'deni reza', alamat:'jl angkasa', kota:'makassar', phone:'160'},
	{nama:'fina', alamat:'jl surya', kota:'manado', phone:'161'},
	{nama:'hasan', alamat:'jl pelangi', kota:'semarang', phone:'162'},
	{nama:'indra', alamat:'jl teratai', kota:'tangerang', phone:'163'},
	{nama:'kevin', alamat:'jl nelayan', kota:'balikpapan', phone:'164'},
	{nama:'tia', alamat:'jl jambu', kota:'batam', phone:'165'},
	{nama:'david', alamat:'jl kenanga', kota:'pontianak', phone:'166'},
	{nama:'jose', alamat:'jl suren', kota:'banjarmasin', phone:'167'},
	{nama:'melati', alamat:'jl anggrek', kota:'kendari', phone:'168'},
	{nama:'benny', alamat:'jl cemara', kota:'jayapura', phone:'169'},
	{nama:'siska', alamat:'jl sejahtera', kota:'gorontalo', phone:'170'},
	{nama:'vito', alamat:'jl arjuna', kota:'surabaya', phone:'171'},
	{nama:'cahyo', alamat:'jl mangga', kota:'padang', phone:'172'},
	{nama:'dika', alamat:'jl pepaya', kota:'maluku', phone:'173'},
	{nama:'faisal', alamat:'jl rambutan', kota:'ambon', phone:'174'},
	{nama:'tania', alamat:'jl apel', kota:'ntt', phone:'175'},
	{nama:'raka', alamat:'jl kelapa', kota:'ternate', phone:'176'},
	{nama:'hendra', alamat:'jl durian', kota:'kupang', phone:'177'},
	{nama:'amir', alamat:'jl ceri', kota:'samarinda', phone:'178'},
	{nama:'wulan', alamat:'jl pinus', kota:'cilacap', phone:'179'},
	{nama:'rio', alamat:'jl jati', kota:'pati', phone:'180'},
	{nama:'febri', alamat:'jl akasia', kota:'serang', phone:'181'},
	{nama:'gina', alamat:'jl kenari', kota:'cilegon', phone:'182'},
	{nama:'hari', alamat:'jl salak', kota:'garut', phone:'183'},
	{nama:'luna', alamat:'jl sirsak', kota:'tasikmalaya', phone:'184'},
	{nama:'niko', alamat:'jl sonokeling', kota:'cianjur', phone:'185'},
	{nama:'putri', alamat:'jl mahoni', kota:'purwokerto', phone:'186'},
	{nama:'johan', alamat:'jl sengon', kota:'madiun', phone:'187'},
	{nama:'isna', alamat:'jl waru', kota:'nganjuk', phone:'188'},
	{nama:'reza', alamat:'jl kayu', kota:'blitar', phone:'189'},
	{nama:'fani', alamat:'jl lemon', kota:'pacitan', phone:'190'},
	{nama:'bayu', alamat:'jl jeruk', kota:'kediri', phone:'191'},
	{nama:'zaki', alamat:'jl bangka', kota:'magelang', phone:'192'},
	{nama:'rino', alamat:'jl plum', kota:'cilacap', phone:'193'},
	{nama:'anwar', alamat:'jl cherry', kota:'lampung', phone:'194'},
	{nama:'soni', alamat:'jl kiwi', kota:'banjarmasin', phone:'195'},
	{nama:'tomy', alamat:'jl bengkoang', kota:'batam', phone:'196'},
	{nama:'lili', alamat:'jl labu', kota:'medan', phone:'197'},
	{nama:'dennis', alamat:'jl beringin', kota:'pontianak', phone:'198'},
	{nama:'ika', alamat:'jl mahkota', kota:'jambi', phone:'199'},
	{nama:'yudi', alamat:'jl elang', kota:'kendari', phone:'200'}
] 

const data = {
		persons: [...persons]
}