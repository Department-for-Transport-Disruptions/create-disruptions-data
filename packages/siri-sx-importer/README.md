# siri-sx-importer

This script is for importing SIRI-SX files into the Disruptions tool.

It performs the following functions:
1. Converts the SIRI-SX xml into JSON
2. Creates disruptionInfo in the format needed for cdd-disruptions-table DynamoDB table
3. Maps over a disruption to create consequenceInfo in the format needed for DynamoDB
4. Publishes disruptionInfo and consequenceInfo to cdd-disruptions-table DynamoDB table (ensure correct stage name is used)

## Pre-reqs
 
### Organisations:
In order to import disruptions and map them to the correct organisation ensure the following:
- The ```<ParticipantRef>``` in the xml contains the organisations name as displayed in the disruptions tool


- The organisations table in the stage where you are trying to import the SIRI-SX data contains all the organisations listed in the SIRI-SX file.
  - e.g. If you are importing SIRI-SX to the test environment and that SIRI-SX file contains disruptions relating to "TfGM", you must make sure that the ```cdd-organisations-table-test``` DynamoDB table has TfGM listed as an operator

## Usage

<!-- usage -->

1. Copy and paste the SIRI-SX xml file to be imported into the ```siri-sx-importer``` directory
2. Log in to the required AWS profile
3. Run the command:



