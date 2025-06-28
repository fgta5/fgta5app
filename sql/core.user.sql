-- core.user  --
-- DLL File ---

-- Create table: core."user

		CREATE TABLE core."user" (
			user_id BIGINT GENERATED ALWAYS AS IDENTITY,
			CONSTRAINT user_pk PRIMARY KEY (user_id)
		);
		COMMENT ON TABLE core."user" IS '';
	

-- =============================================
-- FIELDS 
-- =============================================




-- **** user_nickname *******************************************

-- ADD Column

		ALTER TABLE core."user" ADD user_nickname text NOT NULL DEFAULT '';
		COMMENT ON COLUMN core."user".user_nickname IS '';
	
-- MODIFY Column

		ALTER TABLE core."user" 
			ALTER COLUMN user_nickname TYPE text,
			ALTER COLUMN user_nickname SET DEFAULT '',
			ALTER COLUMN user_nickname SET NOT NULL;
		COMMENT ON COLUMN core."user".user_nickname IS '';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."user" DROP CONSTRAINT user_nickname;



-- **** user_fullname *******************************************

-- ADD Column

		ALTER TABLE core."user" ADD user_fullname text NOT NULL DEFAULT '';
		COMMENT ON COLUMN core."user".user_fullname IS '';
	
-- MODIFY Column

		ALTER TABLE core."user" 
			ALTER COLUMN user_fullname TYPE text,
			ALTER COLUMN user_fullname SET DEFAULT '',
			ALTER COLUMN user_fullname SET NOT NULL;
		COMMENT ON COLUMN core."user".user_fullname IS '';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."user" DROP CONSTRAINT user_fullname;



-- **** user_isdisabled *******************************************

-- ADD Column

		ALTER TABLE core."user" ADD user_isdisabled boolean NOT NULL DEFAULT false;
		COMMENT ON COLUMN core."user".user_isdisabled IS '';
	
-- MODIFY Column

		ALTER TABLE core."user" 
			ALTER COLUMN user_isdisabled TYPE boolean,
			ALTER COLUMN user_isdisabled SET DEFAULT false,
			ALTER COLUMN user_isdisabled SET NOT NULL;
		COMMENT ON COLUMN core."user".user_isdisabled IS '';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."user" DROP CONSTRAINT user_isdisabled;



-- **** user_email *******************************************

-- ADD Column

		ALTER TABLE core."user" ADD user_email text NULL ;
		COMMENT ON COLUMN core."user".user_email IS '';
	
-- MODIFY Column

		ALTER TABLE core."user" 
			ALTER COLUMN user_email TYPE text,
			ALTER COLUMN user_email DROP DEFAULT,
			ALTER COLUMN user_email DROP NOT NULL;
		COMMENT ON COLUMN core."user".user_email IS '';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."user" DROP CONSTRAINT user_email;



-- **** user_password *******************************************

-- ADD Column

		ALTER TABLE core."user" ADD user_password text NULL ;
		COMMENT ON COLUMN core."user".user_password IS 'password user terenkripsi';
	
-- MODIFY Column

		ALTER TABLE core."user" 
			ALTER COLUMN user_password TYPE text,
			ALTER COLUMN user_password DROP DEFAULT,
			ALTER COLUMN user_password DROP NOT NULL;
		COMMENT ON COLUMN core."user".user_password IS 'password user terenkripsi';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."user" DROP CONSTRAINT user_password;



-- **** _createby *******************************************

-- ADD Column

		ALTER TABLE core."user" ADD _createby bigint NULL ;
		COMMENT ON COLUMN core."user"._createby IS '';
	
-- MODIFY Column

		ALTER TABLE core."user" 
			ALTER COLUMN _createby TYPE bigint,
			ALTER COLUMN _createby DROP DEFAULT,
			ALTER COLUMN _createby DROP NOT NULL;
		COMMENT ON COLUMN core."user"._createby IS '';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."user" DROP CONSTRAINT _createby;

-- ADD Constraint

					ALTER TABLE core."user"
						ADD CONSTRAINT _createby
						FOREIGN KEY (_createby)
						REFERENCES core."user"(user_id)
				



-- **** _createdate *******************************************

-- ADD Column

		ALTER TABLE core."user" ADD _createdate timestamp WITH TIME ZONE NOT NULL DEFAULT (now());
		COMMENT ON COLUMN core."user"._createdate IS '';
	
-- MODIFY Column

		ALTER TABLE core."user" 
			ALTER COLUMN _createdate TYPE timestamp WITH TIME ZONE,
			ALTER COLUMN _createdate SET DEFAULT (now()),
			ALTER COLUMN _createdate SET NOT NULL;
		COMMENT ON COLUMN core."user"._createdate IS '';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."user" DROP CONSTRAINT _createdate;



-- **** _modifyby *******************************************

-- ADD Column

		ALTER TABLE core."user" ADD _modifyby bigint NULL ;
		COMMENT ON COLUMN core."user"._modifyby IS '';
	
-- MODIFY Column

		ALTER TABLE core."user" 
			ALTER COLUMN _modifyby TYPE bigint,
			ALTER COLUMN _modifyby DROP DEFAULT,
			ALTER COLUMN _modifyby DROP NOT NULL;
		COMMENT ON COLUMN core."user"._modifyby IS '';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."user" DROP CONSTRAINT _modifyby;

-- ADD Constraint

					ALTER TABLE core."user"
						ADD CONSTRAINT _modifyby
						FOREIGN KEY (_modifyby)
						REFERENCES core."user"(user_id)
				



-- **** _modifydate *******************************************

-- ADD Column

		ALTER TABLE core."user" ADD _modifydate timestamp WITH TIME ZONE NULL ;
		COMMENT ON COLUMN core."user"._modifydate IS '';
	
-- MODIFY Column

		ALTER TABLE core."user" 
			ALTER COLUMN _modifydate TYPE timestamp WITH TIME ZONE,
			ALTER COLUMN _modifydate DROP DEFAULT,
			ALTER COLUMN _modifydate DROP NOT NULL;
		COMMENT ON COLUMN core."user"._modifydate IS '';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."user" DROP CONSTRAINT _modifydate;

-- Clear All Unique Constraint

				ALTER TABLE core."user"
					DROP CONSTRAINT user_nickname;
			

				ALTER TABLE core."user"
					DROP CONSTRAINT user_email;
			


-- Recreate Unique Constraint

				ALTER TABLE  core."user"
					ADD CONSTRAINT user_nickname UNIQUE (user_nickname);			
			

				ALTER TABLE  core."user"
					ADD CONSTRAINT user_email UNIQUE (user_email);			
			



-- POST SQL ================================DO $$
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

