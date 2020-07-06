import React from 'react';
import {
  useRecords,
  useRecordById,
  useWatchable
} from '@airtable/blocks/ui';
const { compose, withProps, lifecycle } = require("recompose");
const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  DirectionsRenderer,
} = require("react-google-maps");
import {cursor} from '@airtable/blocks';
import { APIKEY } from '../.key';

export function TripMaps({tripDetails, activeTable, selectedFieldId, selectedRecordId }) {
    let selectedDayTripRecords = [];
    if (selectedRecordId) {
        // We use getFieldByIdIfExists because the field might be deleted.
        const selectedField = selectedFieldId ? activeTable.getFieldByIdIfExists(selectedFieldId) : null;
        const selectedRecord = useRecordById(activeTable, selectedRecordId ? selectedRecordId : '', {
          fields: ["Day"],
        });

        // Triggers a re-render if the user switches table or view.
        // RecordPreview may now need to render a preview, or render nothing at all.
        useWatchable(cursor, ['activeTableId', 'activeViewId']);

        const selectedDayTrip = selectedRecord && selectedRecord.getCellValueAsString("Day");

        const dayField = activeTable ? activeTable.getFieldByNameIfExists("Day") : null;
        const latField = activeTable ? activeTable.getFieldByNameIfExists("lat") : null;
        const lngField = activeTable ? activeTable.getFieldByNameIfExists("lng") : null;
        const allRecords = useRecords(dayField ? activeTable : null, {
          fields: dayField ? [dayField, latField, lngField] : [],
        });
        selectedDayTripRecords = allRecords.filter((record) => {
            if (record.getCellValue(dayField) === selectedDayTrip) {
                return record;
            }
        });
    }

    if ( (tripDetails && tripDetails.length) || selectedDayTripRecords.length) {
      const MapWithADirectionsRenderer = compose(
        withProps({
          googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${APIKEY}&v=3.exp&libraries=geometry,drawing,places`,
          loadingElement: <div style={{ height: `100%` }} />,
          containerElement: <div style={{ height: `400px` }} />,
          mapElement: <div style={{ height: `100%` }} />,
        }),
        withScriptjs,
        withGoogleMap,
        lifecycle({
          componentDidMount() {
            let route = {};
            if (selectedFieldId && selectedDayTripRecords.length) {
              const waypoints = selectedDayTripRecords.map((record) => {
                return { location: new google.maps.LatLng(record.getCellValueAsString("lat"), record.getCellValueAsString("lng"))}
              });
              const origin = waypoints.shift();
              const destination = waypoints.pop();
              route = {
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING,
                waypoints: waypoints
              }
            } else if (tripDetails.length) {
              const firstDayTrips = tripDetails.filter((trip) => {
                return trip.day === 1;
              });
              const waypoints = firstDayTrips.map((trip) => {
                return { location: new google.maps.LatLng(trip.coord_lat, trip.coord_long)}
              });
              const origin = waypoints.shift();
              const destination = waypoints.pop();
              route = {
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING,
                waypoints: waypoints
              }
            }
            const DirectionsService = new google.maps.DirectionsService();

            DirectionsService.route(route, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                this.setState({
                directions: result,
                });
            } else {
                console.error(`error fetching directions ${result}`);
            }
            });
          }
        })
      )(props =>
        <GoogleMap
          defaultZoom={7}
          defaultCenter={new google.maps.LatLng(37.3334864, -121.9228839)}
        >
          {props.directions && <DirectionsRenderer directions={props.directions} />}
        </GoogleMap>
      );
      return (<MapWithADirectionsRenderer />);
    }
    return (<></>);
}