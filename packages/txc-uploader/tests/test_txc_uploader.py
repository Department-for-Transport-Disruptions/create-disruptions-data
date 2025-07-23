import datetime
import os
from unittest.mock import MagicMock, patch

import boto3
import pytest
from psycopg2.extensions import cursor
from tests.helpers import test_xml_helpers
from tests.helpers.test_data import test_data
from txc_processor import (
    calculate_days_of_operation,
    check_file_has_usable_data,
    collect_journey_pattern_section_refs_and_info,
    collect_journey_patterns,
    collect_track_data,
    collect_vehicle_journey,
    create_unique_line_id,
    download_from_s3_and_write_to_db,
    extract_data_for_txc_operator_service_table,
    format_vehicle_journeys,
    is_service_operational,
    iterate_through_journey_patterns_and_run_insert_queries,
    make_list,
    select_route_and_run_insert_query,
)

logger = MagicMock()
mock_data_dict = test_xml_helpers.generate_mock_data_dict()
mock_non_bus_dict = test_xml_helpers.generate_mock_ferry_txc_data_dict()
mock_invalid_data_dict = test_xml_helpers.generate_mock_invalid_data_dict()
mock_tracks_data_dict = test_xml_helpers.generate_mock_txc_tracks_data_dict()


class TestLineIdGeneration:
    def test_function_returns_correctly_structured_line_id(self):
        assert (create_unique_line_id("BLAC", "UNIQ123")) == "UZ000BLAC:BLACUNIQ123"


class TestNonBusFileHasUsableData:
    def test_non_bus_file_with_valid_data_is_usable(self):
        data = mock_non_bus_dict
        service = mock_non_bus_dict["TransXChange"]["Services"]["Service"]
        assert check_file_has_usable_data(data, service) == True


class TestFileHasUsableData:
    def test_file_with_valid_data_is_usable(self):
        data = mock_data_dict
        service = mock_data_dict["TransXChange"]["Services"]["Service"]
        assert check_file_has_usable_data(data, service) == True

    def test_file_with_invalid_data_is_not_usable(self):
        data = mock_invalid_data_dict
        service = mock_invalid_data_dict["TransXChange"]["Services"]["Service"]
        assert check_file_has_usable_data(data, service) == False


class TestCalculateDaysOfOperation:
    @pytest.mark.parametrize(
        "days_of_week, expected_result",
        [
            (
                {"MondayToFriday": None},
                {
                    "Monday": None,
                    "Tuesday": None,
                    "Wednesday": None,
                    "Thursday": None,
                    "Friday": None,
                },
            ),
            ({"Monday": None}, {"Monday": None}),
            ({"Weekend": None}, {"Saturday": None, "Sunday": None}),
            (
                {"NotMonday": None},
                {
                    "Tuesday": None,
                    "Wednesday": None,
                    "Thursday": None,
                    "Friday": None,
                    "Saturday": None,
                    "Sunday": None,
                },
            ),
            (
                None,
                {},
            ),
        ],
    )
    def test_calculate_days_of_operation(self, days_of_week, expected_result):
        assert calculate_days_of_operation(days_of_week) == expected_result


class TestJourneyIsOperational:
    @pytest.mark.parametrize(
        "vehicle_journey, expected_result",
        [
            (test_data.generate_mock_journey({"MondayToFriday": None}), True),
            (test_data.generate_mock_journey({"Thursday": None}), True),
            (test_data.generate_mock_journey({"NotThursday": None}), False),
        ],
    )
    def test_journey_is_operational_using_vehicle_journey(
        self, vehicle_journey, expected_result
    ):
        service_operating_profile = mock_data_dict["TransXChange"]["Services"][
            "Service"
        ]["OperatingProfile"]
        service_operating_period = mock_data_dict["TransXChange"]["Services"][
            "Service"
        ]["OperatingPeriod"]
        assert (
            is_service_operational(
                vehicle_journey,
                [],
                service_operating_profile,
                service_operating_period,
                datetime.date(2025, 5, 8),
            )
            == expected_result
        )

    @pytest.mark.parametrize(
        "service_operating_profile, expected_result",
        [
            (test_data.generate_mock_operating_profile({"MondayToFriday": None}), True),
            (test_data.generate_mock_operating_profile({"Thursday": None}), True),
            (test_data.generate_mock_operating_profile({"NotThursday": None}), False),
            (None, True),
        ],
    )
    def test_journey_is_operational_using_operating_profile(
        self, service_operating_profile, expected_result
    ):
        vehicle_journey = test_data.mock_journey_no_operating_profile
        service_operating_period = mock_data_dict["TransXChange"]["Services"][
            "Service"
        ]["OperatingPeriod"]
        assert (
            is_service_operational(
                vehicle_journey,
                [],
                service_operating_profile,
                service_operating_period,
                datetime.date(2025, 5, 8),
            )
            == expected_result
        )

    def test_journey_is_operational_using_operating_period(self):
        vehicle_journey = test_data.generate_mock_journey({"MondayToFriday": None})
        service_operating_profile = None
        service_operating_period = {"StartDate": "2018-01-28", "EndDate": "2019-12-31"}
        assert (
            is_service_operational(
                vehicle_journey,
                [],
                service_operating_profile,
                service_operating_period,
                datetime.date(2025, 5, 8),
            )
            == False
        )

    @pytest.mark.parametrize(
        "vehicle_journey, bank_holidays, expected_result",
        [
            (
                test_data.generate_mock_journey_bank_holiday(
                    {"DaysOfNonOperation": {"AllBankHolidays": None}}
                ),
                [
                    {
                        "title": "Mock bank holiday",
                        "date": "2025-05-08",
                    }
                ],
                False,
            ),
            (
                test_data.generate_mock_journey_bank_holiday(
                    {"DaysOfOperation": {"AllBankHolidays": None}}
                ),
                [
                    {
                        "title": "Mock bank holiday",
                        "date": "2025-05-08",
                    }
                ],
                True,
            ),
            (
                test_data.generate_mock_journey_bank_holiday(
                    {"DaysOfNonOperation": {"SpringBank": None}}
                ),
                [
                    {
                        "title": "Spring bank holiday",
                        "date": "2025-05-08",
                    }
                ],
                False,
            ),
            (
                test_data.generate_mock_journey_bank_holiday(
                    {"DaysOfOperation": {"SpringBank": None}}
                ),
                [
                    {
                        "title": "Spring bank holiday",
                        "date": "2025-05-08",
                    }
                ],
                True,
            ),
        ],
    )
    def test_journey_is_operational_bank_holiday(
        self, vehicle_journey, bank_holidays, expected_result
    ):
        service_operating_profile = None
        service_operating_period = mock_data_dict["TransXChange"]["Services"][
            "Service"
        ]["OperatingPeriod"]
        assert (
            is_service_operational(
                vehicle_journey,
                bank_holidays,
                service_operating_profile,
                service_operating_period,
                datetime.date(2025, 5, 8),
            )
            == expected_result
        )


class TestDatabaseInsertQuerying:
    @patch("txc_processor.insert_into_txc_journey_pattern_table")
    @patch("txc_processor.insert_into_txc_journey_pattern_link_table")
    def test_insert_methods_are_called_correct_number_of_times(
        self, mock_jp_insert, mock_jpl_insert
    ):
        service = mock_data_dict["TransXChange"]["Services"]["Service"]
        mock_journey_patterns = collect_journey_patterns(mock_data_dict, service)
        vehicle_journeys, _ = format_vehicle_journeys(
            mock_data_dict["TransXChange"]["VehicleJourneys"]["VehicleJourney"],
            "l_4_ANW",
            [],
            service,
        )
        mock_jp_insert.side_effect = [9, 27, 13, 1, 11, 5, 28, 12, 10, 6, 13, 27, 4]
        mock_cursor = MagicMock()
        mock_op_service_id = 12

        iterate_through_journey_patterns_and_run_insert_queries(
            mock_cursor,
            mock_data_dict,
            mock_op_service_id,
            service,
            vehicle_journeys,
            "JP4",
            logger,
        )

        assert mock_jp_insert.call_count == len(mock_journey_patterns)
        assert mock_jpl_insert.call_count == len(mock_journey_patterns)


class TestDataCollectionFunctionality:
    def test_extract_data_for_txc_operator_service_table(self):
        expected_operator_and_service_info = (
            "ANWE",
            "2018-01-28",
            "2099-12-31",
            "ANW",
            "The Pike - Evesham Country Park",
            "Evesham Country Park - The Pike",
            "Macclesfield - Upton Priory Circular",
            "NW_01_ANW_4_1",
            "Macclesfield",
            "Macclesfield",
            "bus",
        )
        operator = mock_data_dict["TransXChange"]["Operators"]["Operator"]
        service = mock_data_dict["TransXChange"]["Services"]["Service"]
        line = service["Lines"]["Line"]

        assert (
            extract_data_for_txc_operator_service_table(operator, service, line)
            == expected_operator_and_service_info
        )

    def test_extract_data_for_non_bus_txc_operator_service_table(self):
        expected_operator_and_service_info = (
            "NXSF",
            "2022-07-25",
            "2023-02-02",
            "NEXUS Ferry",
            "",
            "",
            "South Shields - North Shields",
            "NE_04_FER_FERR_1",
            "South Shields",
            "North Shields",
            "ferry",
        )
        operator = mock_non_bus_dict["TransXChange"]["Operators"]["Operator"]
        service = mock_non_bus_dict["TransXChange"]["Services"]["Service"]
        line = service["Lines"]["Line"]

        assert (
            extract_data_for_txc_operator_service_table(operator, service, line)
            == expected_operator_and_service_info
        )

    def test_collect_journey_pattern_section_refs_and_info(self):
        mock_raw_journey_patterns = mock_data_dict["TransXChange"]["Services"][
            "Service"
        ]["StandardService"]["JourneyPattern"]
        assert (
            collect_journey_pattern_section_refs_and_info(mock_raw_journey_patterns)
            == test_data.expected_list_of_journey_pattern_section_refs
        )

    def test_collect_journey_patterns(self):
        service = mock_data_dict["TransXChange"]["Services"]["Service"]
        assert (
            collect_journey_patterns(mock_data_dict, service)
            == test_data.expected_list_of_journey_patterns
        )

    def test_collect_vehicle_journey(self):
        mock_service_operating_profile = mock_data_dict["TransXChange"]["Services"][
            "Service"
        ]["OperatingProfile"]
        mock_service_operating_period = mock_data_dict["TransXChange"]["Services"][
            "Service"
        ]["OperatingPeriod"]
        assert (
            collect_vehicle_journey(
                mock_data_dict["TransXChange"]["VehicleJourneys"]["VehicleJourney"][0],
                [],
                mock_service_operating_profile,
                mock_service_operating_period,
            )
            == test_data.expected_vehicle_journey
        )

    @patch("txc_processor.insert_into_txc_journey_pattern_table")
    @patch("txc_processor.insert_into_txc_journey_pattern_link_table")
    def test_correct_route_ref_and_links_selected_for_journey_pattern(
        self, mock_jp_insert, mock_jpl_insert
    ):
        service = mock_tracks_data_dict["TransXChange"]["Services"]["Service"]
        mock_cursor = MagicMock()
        mock_op_service_id = 12
        vehicle_journeys, _ = format_vehicle_journeys(
            mock_data_dict["TransXChange"]["VehicleJourneys"]["VehicleJourney"],
            "l_4_ANW",
            [],
            service,
        )
        route_ref, link_refs = iterate_through_journey_patterns_and_run_insert_queries(
            mock_cursor,
            mock_tracks_data_dict,
            mock_op_service_id,
            service,
            vehicle_journeys,
            "JP1",
            logger,
        )

        assert route_ref == "RT1"
        assert link_refs == [
            "RL1",
            "RL2",
            "RL3",
            "RL4",
            "RL5",
            "RL6",
            "RL7",
            "RL8",
            "RL9",
            "RL10",
            "RL11",
            "RL12",
            "RL13",
        ]

    @patch("txc_processor.insert_into_txc_tracks_table")
    def test_correct_tracks_are_inserted_with_multiple_route_sections(
        self, mock_routes_insert
    ):
        mock_cursor = MagicMock(spec=cursor)
        mock_op_service_id = 12
        select_route_and_run_insert_query(
            mock_cursor,
            mock_tracks_data_dict,
            mock_op_service_id,
            "RT1",
            [
                "RL1",
                "RL2",
                "RL3",
                "RL4",
                "RL5",
                "RL6",
                "RL7",
                "RL8",
                "RL9",
                "RL10",
                "RL11",
                "RL12",
                "RL13",
            ],
        )

        mock_routes_insert.assert_called_once_with(
            mock_cursor,
            test_data.expected_tracks_data_multiple_sections,
            mock_op_service_id,
        )

    @patch("txc_processor.insert_into_txc_tracks_table")
    def test_correct_tracks_are_inserted_with_one_route_section(
        self, mock_routes_insert
    ):
        mock_cursor = MagicMock(spec=cursor)
        mock_op_service_id = 12
        select_route_and_run_insert_query(
            mock_cursor,
            mock_tracks_data_dict,
            mock_op_service_id,
            "RT3",
            ["RL14"],
        )

        mock_routes_insert.assert_called_once_with(
            mock_cursor,
            test_data.expected_tracks_data_single_section,
            mock_op_service_id,
        )

    @patch("txc_processor.insert_into_txc_tracks_table")
    def test_no_tracks_inserted_when_coordinates_missing(self, mock_routes_insert):
        mock_cursor = MagicMock(spec=cursor)
        mock_op_service_id = 12
        mock_tracks_data_dict["TransXChange"]["RouteSections"]["RouteSection"] = [
            {
                "@id": "RS1",
                "RouteLink": {
                    "@id": "RL1",
                    "Track": {
                        "Mapping": {
                            "Location": [
                                {
                                    "@id": "L1",
                                }
                            ]
                        }
                    },
                },
            }
        ]

        select_route_and_run_insert_query(
            mock_cursor,
            mock_tracks_data_dict,
            mock_op_service_id,
            "RT1",
            ["RL1"],
        )

        mock_routes_insert.assert_not_called()


class TestCollectTrackData:
    def test_omit_easting_northing_from_tracks(self):
        route_sections = [
            {
                "@id": "section1",
                "RouteLink": [
                    {
                        "@id": "link1",
                        "Track": {
                            "Mapping": {
                                "Location": [
                                    {"Easting": 500000, "Northing": 200000},
                                    {"Longitude": 1.1111, "Latitude": 2.2222},
                                    {
                                        "Translation": {
                                            "Easting": 600000,
                                            "Northing": 300000,
                                        }
                                    },
                                    {
                                        "Translation": {
                                            "Longitude": 3.3333,
                                            "Latitude": 4.4444,
                                        }
                                    },
                                ]
                            }
                        },
                    },
                ],
            }
        ]
        route_section_refs = ["section1"]
        link_refs = ["link1"]
        expected_routes = [
            {"longitude": 1.1111, "latitude": 2.2222},
            {"longitude": 3.3333, "latitude": 4.4444},
        ]

        result = collect_track_data(route_sections, route_section_refs, link_refs)
        assert result == expected_routes

    def test_omit_track_data_with_none_values(self):
        route_sections = [
            {
                "@id": "section1",
                "RouteLink": [
                    {
                        "@id": "link1",
                        "Track": {
                            "Mapping": {
                                "Location": [
                                    {
                                        "Translation": {
                                            "Easting": 500000,
                                            "Northing": 200000,
                                        }
                                    },
                                    {
                                        "Translation": {
                                            "Longitude": 1.1111,
                                            "Latitude": 2.2222,
                                        }
                                    },
                                    {"Random": "Value"},
                                ]
                            }
                        },
                    },
                ],
            }
        ]
        route_section_refs = ["section1"]
        link_refs = ["link1"]
        expected_routes = [
            {"longitude": 1.1111, "latitude": 2.2222},
        ]

        result = collect_track_data(route_sections, route_section_refs, link_refs)
        assert result == expected_routes


class TestMainFunctionality:
    @patch("txc_processor.write_to_database")
    def test_integration_between_s3_download_and_database_write_functionality(
        self, db_patch, s3, cloudwatch
    ):
        dir_path = os.path.dirname(os.path.realpath(__file__))
        mock_file_dir = dir_path + "/helpers/test_data/mock_txc.xml"
        mock_bucket = "test-bucket"
        mock_key = "20250213/tnds/WM/test-key"
        db_connection = MagicMock()
        conn = boto3.resource("s3", region_name="eu-west-2")
        # pylint: disable=no-member
        conn.create_bucket(
            Bucket=mock_bucket,
            CreateBucketConfiguration={"LocationConstraint": "eu-west-2"},
        )
        s3.put_object(Bucket=mock_bucket, Key=mock_key, Body=open(mock_file_dir, "rb"))

        download_from_s3_and_write_to_db(
            s3,
            cloudwatch,
            mock_bucket,
            mock_key,
            mock_file_dir,
            db_connection,
            logger,
            {},
        )
        db_patch.assert_called_once_with(
            mock_data_dict,
            "WM",
            "tnds",
            mock_key,
            db_connection,
            logger,
            cloudwatch,
            {},
        )
