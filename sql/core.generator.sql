-- core.generator  --
-- DLL File ---

-- Create table: core."generator

		CREATE TABLE core."generator" (
			generator_id BIGINT GENERATED ALWAYS AS IDENTITY,
			CONSTRAINT generator_pk PRIMARY KEY (generator_id)
		);
		COMMENT ON TABLE core."generator" IS '';
	

-- =============================================
-- FIELDS 
-- =============================================




-- **** generator_appname *******************************************

-- ADD Column

		ALTER TABLE core."generator" ADD generator_appname text NOT NULL DEFAULT '';
		COMMENT ON COLUMN core."generator".generator_appname IS '';
	
-- MODIFY Column

		ALTER TABLE core."generator" 
			ALTER COLUMN generator_appname TYPE text,
			ALTER COLUMN generator_appname SET DEFAULT '',
			ALTER COLUMN generator_appname SET NOT NULL;
		COMMENT ON COLUMN core."generator".generator_appname IS '';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."generator" DROP CONSTRAINT generator_appname;



-- **** generator_modulename *******************************************

-- ADD Column

		ALTER TABLE core."generator" ADD generator_modulename text NOT NULL DEFAULT '';
		COMMENT ON COLUMN core."generator".generator_modulename IS '';
	
-- MODIFY Column

		ALTER TABLE core."generator" 
			ALTER COLUMN generator_modulename TYPE text,
			ALTER COLUMN generator_modulename SET DEFAULT '',
			ALTER COLUMN generator_modulename SET NOT NULL;
		COMMENT ON COLUMN core."generator".generator_modulename IS '';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."generator" DROP CONSTRAINT generator_modulename;



-- **** generator_data *******************************************

-- ADD Column

		ALTER TABLE core."generator" ADD generator_data json NOT NULL ;
		COMMENT ON COLUMN core."generator".generator_data IS '';
	
-- MODIFY Column

		ALTER TABLE core."generator" 
			ALTER COLUMN generator_data TYPE json,
			ALTER COLUMN generator_data DROP DEFAULT,
			ALTER COLUMN generator_data SET NOT NULL;
		COMMENT ON COLUMN core."generator".generator_data IS '';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."generator" DROP CONSTRAINT generator_data;



-- **** _createby *******************************************

-- ADD Column

		ALTER TABLE core."generator" ADD _createby bigint NULL ;
		COMMENT ON COLUMN core."generator"._createby IS '';
	
-- MODIFY Column

		ALTER TABLE core."generator" 
			ALTER COLUMN _createby TYPE bigint,
			ALTER COLUMN _createby DROP DEFAULT,
			ALTER COLUMN _createby DROP NOT NULL;
		COMMENT ON COLUMN core."generator"._createby IS '';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."generator" DROP CONSTRAINT _createby;

-- ADD Constraint

					ALTER TABLE core."generator"
						ADD CONSTRAINT _createby
						FOREIGN KEY (_createby)
						REFERENCES core."user"(user_id)
				



-- **** _createdate *******************************************

-- ADD Column

		ALTER TABLE core."generator" ADD _createdate timestamp WITH TIME ZONE NOT NULL DEFAULT (now());
		COMMENT ON COLUMN core."generator"._createdate IS '';
	
-- MODIFY Column

		ALTER TABLE core."generator" 
			ALTER COLUMN _createdate TYPE timestamp WITH TIME ZONE,
			ALTER COLUMN _createdate SET DEFAULT (now()),
			ALTER COLUMN _createdate SET NOT NULL;
		COMMENT ON COLUMN core."generator"._createdate IS '';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."generator" DROP CONSTRAINT _createdate;



-- **** _modifyby *******************************************

-- ADD Column

		ALTER TABLE core."generator" ADD _modifyby bigint NULL ;
		COMMENT ON COLUMN core."generator"._modifyby IS '';
	
-- MODIFY Column

		ALTER TABLE core."generator" 
			ALTER COLUMN _modifyby TYPE bigint,
			ALTER COLUMN _modifyby DROP DEFAULT,
			ALTER COLUMN _modifyby DROP NOT NULL;
		COMMENT ON COLUMN core."generator"._modifyby IS '';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."generator" DROP CONSTRAINT _modifyby;

-- ADD Constraint

					ALTER TABLE core."generator"
						ADD CONSTRAINT _modifyby
						FOREIGN KEY (_modifyby)
						REFERENCES core."user"(user_id)
				



-- **** _modifydate *******************************************

-- ADD Column

		ALTER TABLE core."generator" ADD _modifydate timestamp WITH TIME ZONE NULL ;
		COMMENT ON COLUMN core."generator"._modifydate IS '';
	
-- MODIFY Column

		ALTER TABLE core."generator" 
			ALTER COLUMN _modifydate TYPE timestamp WITH TIME ZONE,
			ALTER COLUMN _modifydate DROP DEFAULT,
			ALTER COLUMN _modifydate DROP NOT NULL;
		COMMENT ON COLUMN core."generator"._modifydate IS '';
	

-- Foreign Key Constraint


-- Remove Constraint if Available
ALTER TABLE core."generator" DROP CONSTRAINT _modifydate;

-- Clear All Unique Constraint


-- Recreate Unique Constraint

				ALTER TABLE  core."generator"
					ADD CONSTRAINT generator_name UNIQUE (generator_appname, generator_modulename);			
			
