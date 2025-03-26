import { Kysely } from "kysely";

const initialHighwayAuthoritySwaCodeAdminAreaMapping = [
    { administrative_area_code: "099", highway_authority_swa_code: "4405" },
    { administrative_area_code: "001", highway_authority_swa_code: "114" },
    { administrative_area_code: "069", highway_authority_swa_code: "235" },
    { administrative_area_code: "105", highway_authority_swa_code: "4605" },
    { administrative_area_code: "002", highway_authority_swa_code: "2372" },
    { administrative_area_code: "003", highway_authority_swa_code: "2373" },
    { administrative_area_code: "083", highway_authority_swa_code: "4205" },
    { administrative_area_code: "005", highway_authority_swa_code: "1260" },
    { administrative_area_code: "043", highway_authority_swa_code: "1260" },
    { administrative_area_code: "006", highway_authority_swa_code: "335" },
    { administrative_area_code: "008", highway_authority_swa_code: "1445" },
    { administrative_area_code: "009", highway_authority_swa_code: "116" },
    { administrative_area_code: "070", highway_authority_swa_code: "440" },
    { administrative_area_code: "083", highway_authority_swa_code: "4210" },
    { administrative_area_code: "107", highway_authority_swa_code: "4710" },
    { administrative_area_code: "071", highway_authority_swa_code: "535" },
    { administrative_area_code: "151", highway_authority_swa_code: "240" },
    { administrative_area_code: "072", highway_authority_swa_code: "660" },
    { administrative_area_code: "152", highway_authority_swa_code: "665" },
    { administrative_area_code: "107", highway_authority_swa_code: "4705" },
    { administrative_area_code: "082", highway_authority_swa_code: "5030" },
    { administrative_area_code: "107", highway_authority_swa_code: "4725" },
    { administrative_area_code: "082", highway_authority_swa_code: "5990" },
    { administrative_area_code: "105", highway_authority_swa_code: "4635" },
    { administrative_area_code: "068", highway_authority_swa_code: "2741" },
    { administrative_area_code: "073", highway_authority_swa_code: "840" },
    { administrative_area_code: "105", highway_authority_swa_code: "4610" },
    { administrative_area_code: "074", highway_authority_swa_code: "940" },
    { administrative_area_code: "015", highway_authority_swa_code: "1350" },
    { administrative_area_code: "017", highway_authority_swa_code: "1055" },
    { administrative_area_code: "075", highway_authority_swa_code: "1050" },
    { administrative_area_code: "076", highway_authority_swa_code: "1155" },
    { administrative_area_code: "099", highway_authority_swa_code: "4410" },
    { administrative_area_code: "077", highway_authority_swa_code: "1265" },
    { administrative_area_code: "105", highway_authority_swa_code: "4615" },
    { administrative_area_code: "078", highway_authority_swa_code: "1355" },
    { administrative_area_code: "018", highway_authority_swa_code: "2001" },
    { administrative_area_code: "079", highway_authority_swa_code: "1440" },
    { administrative_area_code: "080", highway_authority_swa_code: "1585" },
    { administrative_area_code: "103", highway_authority_swa_code: "4505" },
    { administrative_area_code: "081", highway_authority_swa_code: "1600" },
    { administrative_area_code: "021", highway_authority_swa_code: "650" },
    { administrative_area_code: "084", highway_authority_swa_code: "1770" },
    { administrative_area_code: "022", highway_authority_swa_code: "724" },
    { administrative_area_code: "023", highway_authority_swa_code: "1850" },
    { administrative_area_code: "085", highway_authority_swa_code: "1900" },
    { administrative_area_code: "026", highway_authority_swa_code: "2004" },
    { administrative_area_code: "025", highway_authority_swa_code: "2114" },
    { administrative_area_code: "086", highway_authority_swa_code: "2275" },
    { administrative_area_code: "107", highway_authority_swa_code: "4715" },
    { administrative_area_code: "090", highway_authority_swa_code: "4305" },
    { administrative_area_code: "087", highway_authority_swa_code: "2371" },
    { administrative_area_code: "107", highway_authority_swa_code: "4720" },
    { administrative_area_code: "027", highway_authority_swa_code: "2465" },
    { administrative_area_code: "088", highway_authority_swa_code: "2460" },
    { administrative_area_code: "089", highway_authority_swa_code: "2500" },
    { administrative_area_code: "090", highway_authority_swa_code: "4310" },
    { administrative_area_code: "082", highway_authority_swa_code: "5060" },
    { administrative_area_code: "082", highway_authority_swa_code: "5090" },
    { administrative_area_code: "082", highway_authority_swa_code: "5120" },
    { administrative_area_code: "082", highway_authority_swa_code: "5150" },
    { administrative_area_code: "082", highway_authority_swa_code: "5180" },
    { administrative_area_code: "082", highway_authority_swa_code: "5210" },
    { administrative_area_code: "082", highway_authority_swa_code: "5240" },
    { administrative_area_code: "082", highway_authority_swa_code: "5270" },
    { administrative_area_code: "082", highway_authority_swa_code: "5300" },
    { administrative_area_code: "082", highway_authority_swa_code: "5360" },
    { administrative_area_code: "082", highway_authority_swa_code: "5390" },
    { administrative_area_code: "082", highway_authority_swa_code: "5420" },
    { administrative_area_code: "082", highway_authority_swa_code: "5450" },
    { administrative_area_code: "082", highway_authority_swa_code: "5480" },
    { administrative_area_code: "082", highway_authority_swa_code: "5510" },
    { administrative_area_code: "082", highway_authority_swa_code: "5540" },
    { administrative_area_code: "082", highway_authority_swa_code: "5570" },
    { administrative_area_code: "082", highway_authority_swa_code: "5660" },
    { administrative_area_code: "082", highway_authority_swa_code: "5690" },
    { administrative_area_code: "082", highway_authority_swa_code: "5720" },
    { administrative_area_code: "082", highway_authority_swa_code: "5750" },
    { administrative_area_code: "082", highway_authority_swa_code: "5780" },
    { administrative_area_code: "082", highway_authority_swa_code: "5810" },
    { administrative_area_code: "082", highway_authority_swa_code: "5840" },
    { administrative_area_code: "082", highway_authority_swa_code: "5870" },
    { administrative_area_code: "082", highway_authority_swa_code: "5900" },
    { administrative_area_code: "082", highway_authority_swa_code: "5930" },
    { administrative_area_code: "082", highway_authority_swa_code: "5960" },
    { administrative_area_code: "028", highway_authority_swa_code: "230" },
    { administrative_area_code: "083", highway_authority_swa_code: "4215" },
    { administrative_area_code: "029", highway_authority_swa_code: "2280" },
    { administrative_area_code: "031", highway_authority_swa_code: "734" },
    { administrative_area_code: "032", highway_authority_swa_code: "435" },
    { administrative_area_code: "103", highway_authority_swa_code: "4510" },
    { administrative_area_code: "091", highway_authority_swa_code: "2600" },
    { administrative_area_code: "036", highway_authority_swa_code: "2002" },
    { administrative_area_code: "037", highway_authority_swa_code: "2003" },
    { administrative_area_code: "093", highway_authority_swa_code: "2840" },
    { administrative_area_code: "038", highway_authority_swa_code: "121" },
    { administrative_area_code: "103", highway_authority_swa_code: "4515" },
    { administrative_area_code: "092", highway_authority_swa_code: "2745" },
    { administrative_area_code: "094", highway_authority_swa_code: "2935" },
    { administrative_area_code: "039", highway_authority_swa_code: "3060" },
    { administrative_area_code: "095", highway_authority_swa_code: "3055" },
    { administrative_area_code: "083", highway_authority_swa_code: "4220" },
    { administrative_area_code: "096", highway_authority_swa_code: "3100" },
    { administrative_area_code: "041", highway_authority_swa_code: "540" },
    { administrative_area_code: "042", highway_authority_swa_code: "1160" },
    { administrative_area_code: "044", highway_authority_swa_code: "1775" },
    { administrative_area_code: "046", highway_authority_swa_code: "345" },
    { administrative_area_code: "047", highway_authority_swa_code: "728" },
    { administrative_area_code: "083", highway_authority_swa_code: "4225" },
    { administrative_area_code: "099", highway_authority_swa_code: "4415" },
    { administrative_area_code: "082", highway_authority_swa_code: "5330" },
    { administrative_area_code: "082", highway_authority_swa_code: "5600" },
    { administrative_area_code: "082", highway_authority_swa_code: "5630" },
    { administrative_area_code: "065", highway_authority_swa_code: "355" },
    { administrative_area_code: "049", highway_authority_swa_code: "2470" },
    { administrative_area_code: "083", highway_authority_swa_code: "4230" },
    { administrative_area_code: "105", highway_authority_swa_code: "4620" },
    { administrative_area_code: "090", highway_authority_swa_code: "4320" },
    { administrative_area_code: "099", highway_authority_swa_code: "4420" },
    { administrative_area_code: "097", highway_authority_swa_code: "3245" },
    { administrative_area_code: "097", highway_authority_swa_code: "350" },
    { administrative_area_code: "105", highway_authority_swa_code: "4625" },
    { administrative_area_code: "098", highway_authority_swa_code: "3300" },
    { administrative_area_code: "051", highway_authority_swa_code: "119" },
    { administrative_area_code: "103", highway_authority_swa_code: "4520" },
    { administrative_area_code: "052", highway_authority_swa_code: "1780" },
    { administrative_area_code: "053", highway_authority_swa_code: "1590" },
    { administrative_area_code: "090", highway_authority_swa_code: "4315" },
    { administrative_area_code: "100", highway_authority_swa_code: "3450" },
    { administrative_area_code: "083", highway_authority_swa_code: "4235" },
    { administrative_area_code: "054", highway_authority_swa_code: "738" },
    { administrative_area_code: "055", highway_authority_swa_code: "3455" },
    { administrative_area_code: "101", highway_authority_swa_code: "3500" },
    { administrative_area_code: "103", highway_authority_swa_code: "4525" },
    { administrative_area_code: "102", highway_authority_swa_code: "3600" },
    { administrative_area_code: "057", highway_authority_swa_code: "3935" },
    { administrative_area_code: "083", highway_authority_swa_code: "4240" },
    { administrative_area_code: "058", highway_authority_swa_code: "3240" },
    { administrative_area_code: "059", highway_authority_swa_code: "1595" },
    { administrative_area_code: "060", highway_authority_swa_code: "1165" },
    { administrative_area_code: "083", highway_authority_swa_code: "4245" },
    { administrative_area_code: "082", highway_authority_swa_code: "20" },
    { administrative_area_code: "105", highway_authority_swa_code: "4630" },
    { administrative_area_code: "063", highway_authority_swa_code: "655" },
    { administrative_area_code: "104", highway_authority_swa_code: "3700" },
    { administrative_area_code: "064", highway_authority_swa_code: "340" },
    { administrative_area_code: "093", highway_authority_swa_code: "2845" },
    { administrative_area_code: "106", highway_authority_swa_code: "3800" },
    { administrative_area_code: "074", highway_authority_swa_code: "935" },
    { administrative_area_code: "083", highway_authority_swa_code: "4250" },
    { administrative_area_code: "108", highway_authority_swa_code: "3940" },
    { administrative_area_code: "090", highway_authority_swa_code: "4325" },
    { administrative_area_code: "066", highway_authority_swa_code: "360" },
    { administrative_area_code: "109", highway_authority_swa_code: "1855" },
];

/**
 *
 * @param {Kysely} db
 */
export async function up(db) {
    await db.schema
        .createTable("stops")
        .addColumn("id", "integer", (col) => col.primaryKey().generatedByDefaultAsIdentity())
        .addColumn("atco_code", "text", (col) => col.unique())
        .addColumn("naptan_code", "text")
        .addColumn("plate_code", "text")
        .addColumn("cleardown_code", "text")
        .addColumn("common_name", "text")
        .addColumn("common_name_lang", "text")
        .addColumn("short_common_name", "text")
        .addColumn("short_common_name_lang", "text")
        .addColumn("landmark", "text")
        .addColumn("landmark_lang", "text")
        .addColumn("street", "text")
        .addColumn("street_lang", "text")
        .addColumn("crossing", "text")
        .addColumn("crossing_lang", "text")
        .addColumn("indicator", "text")
        .addColumn("indicator_lang", "text")
        .addColumn("bearing", "text")
        .addColumn("nptg_locality_code", "text")
        .addColumn("locality_name", "text")
        .addColumn("parent_locality_name", "text")
        .addColumn("grand_parent_locality_name", "text")
        .addColumn("town", "text")
        .addColumn("town_lang", "text")
        .addColumn("suburb", "text")
        .addColumn("suburb_lang", "text")
        .addColumn("locality_centre", "text")
        .addColumn("grid_type", "text")
        .addColumn("easting", "text")
        .addColumn("northing", "text")
        .addColumn("longitude", "text")
        .addColumn("latitude", "text")
        .addColumn("stop_type", "text")
        .addColumn("bus_stop_type", "text")
        .addColumn("timing_status", "text")
        .addColumn("default_wait_time", "text")
        .addColumn("notes", "text")
        .addColumn("notes_lang", "text")
        .addColumn("administrative_area_code", "text")
        .addColumn("creation_date_time", "text")
        .addColumn("modification_date_time", "text")
        .addColumn("revision_number", "text")
        .addColumn("modification", "text")
        .addColumn("status", "text")
        .execute();

    await db.schema.createIndex("idx_stops_atco_code").on("stops").column("atco_code").execute();
    await db.schema.createIndex("idx_stops_naptan_code").on("stops").column("naptan_code").execute();
    await db.schema.createIndex("idx_stops_common_name").on("stops").column("common_name").execute();
    await db.schema.createIndex("idx_stops_admin_area_code").on("stops").column("administrative_area_code").execute();
    await db.schema.createIndex("idx_stops_nptg_locality_code").on("stops").column("nptg_locality_code").execute();

    await db.schema
        .createTable("operators")
        .addColumn("id", "integer", (col) => col.primaryKey().generatedByDefaultAsIdentity())
        .addColumn("noc_code", "text", (col) => col.notNull().unique())
        .addColumn("operator_public_name", "text")
        .addColumn("vosa_psv_license_name", "text")
        .addColumn("op_id", "text")
        .addColumn("pub_nm_id", "text")
        .addColumn("noc_cd_qual", "text")
        .addColumn("change_date", "text")
        .addColumn("change_agent", "text")
        .addColumn("change_comment", "text")
        .addColumn("date_ceased", "text")
        .addColumn("data_owner", "text")
        .execute();

    await db.schema.createIndex("idx_operators_noc_code").on("operators").column("noc_code").execute();
    await db.schema.createIndex("idx_operators_pub_nm_id").on("operators").column("pub_nm_id").execute();

    await db.schema
        .createTable("operator_lines")
        .addColumn("id", "integer", (col) => col.primaryKey().generatedByDefaultAsIdentity())
        .addColumn("noc_line_no", "text", (col) => col.notNull())
        .addColumn("noc_code", "text")
        .addColumn("pub_nm", "text")
        .addColumn("ref_nm", "text")
        .addColumn("licence", "text")
        .addColumn("mode", "text")
        .addColumn("tl_reg_own", "text")
        .addColumn("ebsr_agent", "text")
        .addColumn("lo", "text")
        .addColumn("sw", "text")
        .addColumn("wm", "text")
        .addColumn("wa", "text")
        .addColumn("yo", "text")
        .addColumn("nw", "text")
        .addColumn("ne", "text")
        .addColumn("sc", "text")
        .addColumn("se", "text")
        .addColumn("ea", "text")
        .addColumn("em", "text")
        .addColumn("ni", "text")
        .addColumn("nx", "text")
        .addColumn("megabus", "text")
        .addColumn("new_bharat", "text")
        .addColumn("terravision", "text")
        .addColumn("ncsd", "text")
        .addColumn("easybus", "text")
        .addColumn("yorks_rt", "text")
        .addColumn("travel_enq", "text")
        .addColumn("comment", "text")
        .addColumn("audit_date", "text")
        .addColumn("audit_editor", "text")
        .addColumn("audit_comment", "text")
        .addColumn("duplicate", "text")
        .addColumn("date_ceased", "text")
        .addColumn("cessation_comment", "text")
        .execute();

    await db.schema.createIndex("idx_operator_lines_noc_code").on("operator_lines").column("noc_code").execute();

    await db.schema
        .createTable("operator_public_data")
        .addColumn("id", "integer", (col) => col.primaryKey().generatedByDefaultAsIdentity())
        .addColumn("pub_nm_id", "text", (col) => col.notNull())
        .addColumn("operator_public_name", "text")
        .addColumn("pub_nm_qual", "text")
        .addColumn("ttrte_enq", "text")
        .addColumn("fare_enq", "text")
        .addColumn("lost_prop_enq", "text")
        .addColumn("disrupt_enq", "text")
        .addColumn("ebsr_agent", "text")
        .addColumn("compl_enq", "text")
        .addColumn("twitter", "text")
        .addColumn("facebook", "text")
        .addColumn("linkedin", "text")
        .addColumn("youtube", "text")
        .addColumn("change_date", "text")
        .addColumn("change_agent", "text")
        .addColumn("change_comment", "text")
        .addColumn("ceased_date", "text")
        .addColumn("data_owner", "text")
        .addColumn("website", "text")
        .execute();

    await db.schema
        .createIndex("idx_operator_public_data_pub_nm_id")
        .on("operator_public_data")
        .column("pub_nm_id")
        .execute();

    await db.schema
        .createTable("services")
        .addColumn("id", "integer", (col) => col.primaryKey().generatedByDefaultAsIdentity())
        .addColumn("noc_code", "text")
        .addColumn("line_name", "text", (col) => col.notNull())
        .addColumn("start_date", "date")
        .addColumn("operator_short_name", "text")
        .addColumn("service_description", "text")
        .addColumn("service_code", "text")
        .addColumn("region_code", "text")
        .addColumn("data_source", "text", (col) => col.notNull())
        .addColumn("origin", "text")
        .addColumn("destination", "text")
        .addColumn("line_id", "text")
        .addColumn("end_date", "date")
        .addColumn("inbound_direction_description", "text")
        .addColumn("outbound_direction_description", "text")
        .addColumn("mode", "text")
        .addColumn("file_path", "text")
        .addColumn("centre_point_lon", "text")
        .addColumn("centre_point_lat", "text")
        .execute();

    await db.schema.createIndex("idx_services_data_source").on("services").column("data_source").execute();
    await db.schema.createIndex("idx_services_line_name").on("services").column("line_name").execute();
    await db.schema.createIndex("idx_services_noc_code").on("services").column("noc_code").execute();
    await db.schema.createIndex("idx_services_start_date").on("services").column("start_date").execute();
    await db.schema.createIndex("idx_services_line_id").on("services").column("line_id").execute();
    await db.schema.createIndex("idx_services_service_code").on("services").column("service_code").execute();

    await db.schema
        .createTable("service_journey_patterns")
        .addColumn("id", "integer", (col) => col.primaryKey().generatedByDefaultAsIdentity())
        .addColumn("operator_service_id", "integer", (col) => col.notNull())
        .addColumn("destination_display", "text")
        .addColumn("direction", "text")
        .addColumn("route_ref", "text")
        .addColumn("section_refs", "text")
        .addColumn("journey_pattern_ref", "text")
        .execute();

    await db.schema
        .createIndex("idx_service_journey_patterns_operator_service_id")
        .on("service_journey_patterns")
        .column("operator_service_id")
        .execute();
    await db.schema
        .createIndex("idx_service_journey_patterns_journey_pattern_ref")
        .on("service_journey_patterns")
        .column("journey_pattern_ref")
        .execute();

    await db.schema
        .createTable("service_journey_pattern_links")
        .addColumn("journey_pattern_id", "integer", (col) => col.notNull())
        .addColumn("from_atco_code", "text", (col) => col.notNull())
        .addColumn("from_timing_status", "text")
        .addColumn("to_atco_code", "text", (col) => col.notNull())
        .addColumn("to_timing_status", "text")
        .addColumn("runtime", "text")
        .addColumn("order_in_sequence", "integer", (col) => col.notNull())
        .addColumn("from_sequence_number", "text")
        .addColumn("to_sequence_number", "text")
        .execute();

    await db.schema
        .createTable("service_admin_area_codes")
        .addColumn("service_id", "integer", (col) => col.notNull())
        .addColumn("admin_area_code", "text", (col) => col.notNull())
        .addPrimaryKeyConstraint("primary_key", ["service_id", "admin_area_code"])
        .execute();

    await db.schema
        .createIndex("idx_service_admin_area_codes_admin_area_code")
        .on("service_admin_area_codes")
        .column("admin_area_code")
        .execute();

    await db.schema
        .createTable("localities")
        .addColumn("id", "integer", (col) => col.primaryKey().generatedByDefaultAsIdentity())
        .addColumn("nptg_locality_code", "text", (col) => col.notNull())
        .addColumn("locality_name", "text")
        .addColumn("locality_name_lang", "text")
        .addColumn("short_name", "text")
        .addColumn("short_name_lang", "text")
        .addColumn("qualifier_name", "text")
        .addColumn("qualifier_name_lang", "text")
        .addColumn("qualifier_locality_ref", "text")
        .addColumn("qualifier_district_ref", "text")
        .addColumn("parent_locality_name", "text")
        .addColumn("parent_locality_name_lang", "text")
        .addColumn("administrative_area_code", "text", (col) => col.notNull())
        .addColumn("nptg_district_code", "text")
        .addColumn("source_locality_type", "text")
        .addColumn("grid_type", "text")
        .addColumn("easting", "text")
        .addColumn("northing", "text")
        .addColumn("creation_date_time", "text")
        .addColumn("modification_date_time", "text")
        .addColumn("revision_number", "text")
        .addColumn("modification", "text")
        .execute();

    await db.schema
        .createIndex("idx_localities_administrative_area_code")
        .on("localities")
        .column("administrative_area_code")
        .execute();
    await db.schema
        .createIndex("idx_localities_nptg_locality_code")
        .on("localities")
        .column("nptg_locality_code")
        .execute();

    await db.schema
        .createTable("vehicle_journeys")
        .addColumn("id", "integer", (col) => col.primaryKey().generatedByDefaultAsIdentity())
        .addColumn("vehicle_journey_code", "text")
        .addColumn("service_ref", "text")
        .addColumn("line_ref", "text")
        .addColumn("journey_pattern_ref", "text")
        .addColumn("departure_time", "text")
        .addColumn("journey_code", "text")
        .addColumn("operator_service_id", "integer")
        .execute();

    await db.schema
        .createIndex("idx_vehicle_journeys_journey_pattern_ref")
        .on("vehicle_journeys")
        .column("journey_pattern_ref")
        .execute();
    await db.schema.createIndex("idx_vehicle_journeys_line_ref").on("vehicle_journeys").column("line_ref").execute();
    await db.schema
        .createIndex("idx_vehicle_journeys_service_ref")
        .on("vehicle_journeys")
        .column("service_ref")
        .execute();
    await db.schema
        .createIndex("idx_vehicle_journeys_operator_service_id")
        .on("vehicle_journeys")
        .column("operator_service_id")
        .execute();

    await db.schema
        .createTable("tracks")
        .addColumn("id", "integer", (col) => col.primaryKey().generatedByDefaultAsIdentity())
        .addColumn("operator_service_id", "integer")
        .addColumn("longitude", "text")
        .addColumn("latitude", "text")
        .execute();

    await db.schema.createIndex("idx_tracks_operator_service_id").on("tracks").column("operator_service_id").execute();

    await db.schema
        .createTable("nptg_admin_areas")
        .addColumn("id", "integer", (col) => col.primaryKey().generatedByDefaultAsIdentity())
        .addColumn("administrative_area_code", "text", (col) => col.notNull())
        .addColumn("atco_area_code", "text")
        .addColumn("name", "text")
        .addColumn("short_name", "text")
        .execute();

    await db.schema
        .createIndex("idx_nptg_admin_areas_administrative_area_code")
        .on("nptg_admin_areas")
        .column("administrative_area_code")
        .execute();

    await db.schema
        .createTable("roadworks")
        .addColumn("permit_reference_number", "text", (col) => col.primaryKey())
        .addColumn("highway_authority", "text")
        .addColumn("highway_authority_swa_code", "integer")
        .addColumn("works_location_coordinates", "text")
        .addColumn("street_name", "text")
        .addColumn("area_name", "text")
        .addColumn("work_category", "text")
        .addColumn("traffic_management_type", "text")
        .addColumn("proposed_start_date_time", "text")
        .addColumn("proposed_end_date_time", "text")
        .addColumn("actual_start_date_time", "text")
        .addColumn("actual_end_date_time", "text")
        .addColumn("work_status", "text")
        .addColumn("usrn", "text")
        .addColumn("activity_type", "text")
        .addColumn("works_location_type", "text")
        .addColumn("is_traffic_sensitive", "text")
        .addColumn("permit_status", "text")
        .addColumn("town", "text")
        .addColumn("current_traffic_management_type", "text")
        .addColumn("current_traffic_management_type_update_date", "text")
        .addColumn("created_date_time", "text")
        .addColumn("last_updated_date_time", "text")
        .execute();

    await db.schema
        .createTable("highway_authority_admin_areas")
        .addColumn("highway_authority_swa_code", "integer")
        .addColumn("administrative_area_code", "text")
        .execute();

    await db.schema
        .createIndex("idx_highway_authority_admin_areas_administrative_area_code")
        .on("highway_authority_admin_areas")
        .column("administrative_area_code")
        .execute();

    await db.schema
        .createIndex("idx_roadworks_highway_authority_swa_code")
        .on("roadworks")
        .column("highway_authority_swa_code")
        .execute();

    await db
        .insertInto("highway_authority_admin_areas")
        .values(initialHighwayAuthoritySwaCodeAdminAreaMapping)
        .execute();

    await db.schema
        .createIndex("idx_roadworks_actual_end_date_time")
        .on("roadworks")
        .column("actual_end_date_time")
        .execute();

    await db.schema
        .createIndex("idx_roadworks_last_updated_date_time")
        .on("roadworks")
        .column("last_updated_date_time")
        .execute();
}

/**
 *
 * @param {Kysely} db
 */
export async function down(db) {
    await db.schema.dropTable("highway_authority_admin_areas").execute();
    await db.schema.dropTable("roadworks").execute();
    await db.schema.dropTable("nptg_admin_areas").execute();
    await db.schema.dropTable("tracks").execute();
    await db.schema.dropTable("vehicle_journeys").execute();
    await db.schema.dropTable("localities").execute();
    await db.schema.dropTable("service_admin_area_codes").execute();
    await db.schema.dropTable("service_journey_pattern_links").execute();
    await db.schema.dropTable("service_journey_patterns").execute();
    await db.schema.dropTable("services").execute();
    await db.schema.dropTable("operator_public_data").execute();
    await db.schema.dropTable("operator_lines").execute();
    await db.schema.dropTable("operators").execute();
    await db.schema.dropTable("stops").execute();
}
