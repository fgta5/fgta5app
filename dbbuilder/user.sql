DO $$
BEGIN
	-- cek validitas email
	IF EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'valid_email'
		AND conrelid = 'core."user"'::regclass
	) THEN
		ALTER TABLE core."user"
		DROP CONSTRAINT valid_email;
	END IF;

	ALTER TABLE core."user"
	ADD CONSTRAINT valid_email
	CHECK (
		user_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
	);


	-- masukkan user root
	IF NOT EXISTS (
		SELECT 1 FROM core."user" WHERE user_nickname='root'
	) THEN 
	
		INSERT INTO core."user"
		(user_nickname, user_fullname, user_email)
		VALUES
		('root', 'SYSTEM ROOT', 'root@fgta.net');

		UPDATE core."user"
		SET _createby=1
		WHERE user_id=1;

	END IF;
END$$;


/**

INSERT INTO core."user" (user_nickname, user_fullname, user_email, _createby) VALUES
  ('akiranakamura', 'Akira Nakamura', 'akira.nakamura@example.com', 1),
  ('bimasaputra', 'Bima Saputra', 'bima.saputra@example.com', 1),
  ('citrawidjaja', 'Citra Widjaja', 'citra.widjaja@example.com', 1),
  ('dewiputri', 'Dewi Putri', 'dewi.putri@example.com', 1),
  ('ekahasan', 'Eka Hasan', 'eka.hasan@example.com', 1),
  ('fajarlestari', 'Fajar Lestari', 'fajar.lestari@example.com', 1),
  ('gilangprasetyo', 'Gilang Prasetyo', 'gilang.prasetyo@example.com', 1),
  ('hanarahma', 'Hana Rahma', 'hana.rahma@example.com', 1),
  ('imammaulana', 'Imam Maulana', 'imam.maulana@example.com', 1),
  ('juwitaanggraini', 'Juwita Anggraini', 'juwita.anggraini@example.com', 1),
  ('kevinputra', 'Kevin Putra', 'kevin.putra@example.com', 1),
  ('lindahalim', 'Linda Halim', 'linda.halim@example.com', 1),
  ('michaeltan', 'Michael Tan', 'michael.tan@example.com', 1),
  ('nadiayuliana', 'Nadia Yuliana', 'nadia.yuliana@example.com', 1),
  ('oscarhidayat', 'Oscar Hidayat', 'oscar.hidayat@example.com', 1),
  ('putrinovita', 'Putri Novita', 'putri.novita@example.com', 1),
  ('qoriarifin', 'Qori Arifin', 'qori.arifin@example.com', 1),
  ('rizkyzulkarnain', 'Rizky Zulkarnain', 'rizky.zulkarnain@example.com', 1),
  ('salsabilakirana', 'Salsabila Kirana', 'salsabila.kirana@example.com', 1),
  ('taufikbachtiar', 'Taufik Bachtiar', 'taufik.bachtiar@example.com', 1),
  ('umarrahman', 'Umar Rahman', 'umar.rahman@example.com', 1),
  ('vinarosalina', 'Vina Rosalina', 'vina.rosalina@example.com', 1),
  ('wahyusantoso', 'Wahyu Santoso', 'wahyu.santoso@example.com', 1),
  ('xavierlukman', 'Xavier Lukman', 'xavier.lukman@example.com', 1),
  ('yunikartika', 'Yuni Kartika', 'yuni.kartika@example.com', 1),
  ('zakisurya', 'Zaki Surya', 'zaki.surya@example.com', 1),
  ('ahmadismail', 'Ahmad Ismail', 'ahmad.ismail@example.com', 1),
  ('bellahalimah', 'Bella Halimah', 'bella.halimah@example.com', 1),
  ('cahyonugroho', 'Cahyo Nugroho', 'cahyo.nugroho@example.com', 1),
  ('dindasiregar', 'Dinda Siregar', 'dinda.siregar@example.com', 1),
  ('edowinata', 'Edo Winata', 'edo.winata@example.com', 1),
  ('fitrijuliani', 'Fitri Juliani', 'fitri.juliani@example.com', 1),
  ('gerrysusanto', 'Gerry Susanto', 'gerry.susanto@example.com', 1),
  ('hildaazizah', 'Hilda Azizah', 'hilda.azizah@example.com', 1),
  ('indrakusuma', 'Indra Kusuma', 'indra.kusuma@example.com', 1),
  ('jihanlatifah', 'Jihan Latifah', 'jihan.latifah@example.com', 1),
  ('krisnamulyono', 'Krisna Mulyono', 'krisna.mulyono@example.com', 1),
  ('larasandayani', 'Laras Andayani', 'laras.andayani@example.com', 1),
  ('megawahyuni', 'Mega Wahyuni', 'mega.wahyuni@example.com', 1),
  ('nikosutanto', 'Niko Sutanto', 'niko.sutanto@example.com', 1);

  */

