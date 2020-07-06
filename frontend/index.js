import {
    initializeBlock,
    useBase,
    useGlobalConfig,
    registerRecordActionDataCallback,
    useRecordById,
    useLoadable,
    useSettingsButton,
    useWatchable,
    Text,
    TextButton,
} from '@airtable/blocks/ui';
import {cursor} from '@airtable/blocks';
import {ViewType} from '@airtable/blocks/models';
import React, {useState, useEffect, useCallback, Fragment} from 'react';
import ReactDOM from 'react-dom';
import { styles, useStyles } from './index.styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { debounce } from './utilities/debounce';
import { TripMaps } from './components/googleMap';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Loading } from './components/loading';
import { FeatureOptions } from './components/featureOptions';
import { Setting } from './components/UISetting';
import { useSettings } from './utilities/settings';
import { ErrorScreen } from './components/error';
import { tripConstants } from './constants';
import { OutsideTrip } from './components/outsideTrip';
import { Preview } from './components/preview';

function Home() {
    const base = useBase();
    const globalConfig = useGlobalConfig();
    const tableId = globalConfig.get('selectedTableId');
    const table = base.getTableByIdIfExists(tableId);

    const homeStyles = styles();
    const classes = useStyles();
    const [options, setOptions] = useState([{"city_state": "San Francisco, CA"}, {"city_state": "Seattle, WA"}, {"city_state": "Los Angeles, CA"}, {"city_state": "New York City, NY"}, {"city_state": "Boston, MA"}]);
    const [destination, setDestination] = useState('');
    const [tripDetails, setTripDetails] = useState([]);
    const [tripLocationIds, setTripLocationIds] = useState([]);
    const [updateTripLocationId, setUpdateTripLocationId] = useState('');
    const [currentMapUrl, setCurrentMapUrl] = useState('');
    const [hasAddedTrip, setHasAddedTrip] = useState(false);
    const [tripDuration, setTripDuration] = useState(0);
    const [isloading, setIsLoading] = useState(false);
    const [selectedFeature, setFeature] = useState("0");
    const [currentCity, setCurrentCity] = useState("");
    const [direction, setDirection] = useState("");
    const [settingState, setSettingState] = useState({ map: false, preview: true });
    const [outsideTrips, setOutsideTrips] = useState([]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [currentSelectedDay, setCurrentSelectedDay] = useState(0);

    useSettingsButton(() => setIsSettingsOpen(!isSettingsOpen));

    // Caches the currently selected record and field in state. If the user
    // selects a record and a preview appears, and then the user de-selects the
    // record (but does not select another), the preview will remain. This is
    // useful when, for example, the user resizes the blocks pane.
    const [selectedRecordId, setSelectedRecordId] = useState(null);
    const [selectedFieldId, setSelectedFieldId] = useState(null);

    const [recordActionErrorMessage, setRecordActionErrorMessage] = useState('');

    useLoadable(cursor);

    // Update the selectedRecordId and selectedFieldId state when the selected
    // record or field change.
    useWatchable(cursor, ['selectedRecordIds', 'selectedFieldIds'], () => {
        // If the update was triggered by a record being de-selected,
        // the current selectedRecordId will be retained.  This is
        // what enables the caching described above.
        if (cursor.selectedRecordIds.length > 0) {
            // There might be multiple selected records. We'll use the first
            // one.
            setSelectedRecordId(cursor.selectedRecordIds[0]);
        }
        if (cursor.selectedFieldIds.length > 0) {
            // There might be multiple selected fields. We'll use the first
            // one.
            setSelectedFieldId(cursor.selectedFieldIds[0]);
        }
    });

    const {
        isValid,
        settings: {isEnforced, urlTable},
    } = useSettings();

    function handleChange(value) {
      debounceOnChange(value);
    }

    const debounceOnChange = React.useCallback(
        debounce(value => {
           getMatchCityState(value);
        }, 400),
        []
    );

    const getMatchCityState = (value) => {
        // const dbLocationURI = 'http://127.0.0.1:8000/city_state_search/?city_state=';
        const valid_input = encodeURIComponent(value);
        const cityStateSearchUrl = tripConstants.SEARCH_CITY_STATE_URL + valid_input;

        fetch(cityStateSearchUrl)
            .then((result) => {
                return result.json();
            }).then(function(data) {
                const city_states = data.city_state.map((city_state) => {
                    return {"city_state": city_state}
                });
                setOptions(city_states)
            });
    };

    const getFullTripDetails = (value) => {
        if (value) {
            const result = value.split(', ');
            const encodedCity = encodeURIComponent(result[0]);
            const encodedState = encodeURIComponent(result[1]);
            const getFullTripDetailsUrl = `${tripConstants.SEARCH_FULL_TRIP_URL}city=${encodedCity}&state=${encodedState}&n_days=${tripDuration}`
            setIsLoading(true);
            setFetchError(false);
            fetch(getFullTripDetailsUrl)
                .then((result) => {
                    return result.json();
                }).then(function(data) {
                    setIsLoading(false);
                    setTripDetails(data.full_trip_details);
                    setTripLocationIds(data.trip_location_ids);
                    setUpdateTripLocationId(data.trip_location_ids[0]);
                    writeBackToAirtable(data.full_trip_details);
                })
                .catch((error) => {
                    setIsLoading(false);
                    setFetchError(true);
                });

        }
    }

    const getOutsideTripDetails = (value) => {
        if (value) {
            const result = value.split(', ');
            const encodedCity = encodeURIComponent(result[0]);
            const encodedState = encodeURIComponent(result[1]);
            const getOutsideTripDetailsUrl = `${tripConstants.SEARCH_OUTSIDE_TRIP_URL}city=${encodedCity}&state=${encodedState}&direction=${direction}`
            setIsLoading(true);
            setFetchError(false);
            fetch(getOutsideTripDetailsUrl)
                .then((result) => {
                    return result.json();
                }).then(function(data) {
                    setIsLoading(false);
                    setOutsideTrips(data.outside_trip_details);
                    writeOutsideTripsToAirtable(data.outside_trip_details);
                })
                .catch((error) => {
                    setIsLoading(false);
                    setFetchError(true);
                });
        }
    }

    useEffect(() => {
        if (destination !== "", tripDuration > 0) {
            getFullTripDetails(destination);
        }
    }, [destination, tripDuration]);

    useEffect(() => {
        if (currentCity !== "", direction !== "") {
            getOutsideTripDetails(currentCity);
        }
    }, [currentCity, direction]);

    useLoadable(cursor);

    // Update the selectedRecordId and selectedFieldId state when the selected
    // record or field change.
    useWatchable(cursor, ['selectedRecordIds', 'selectedFieldIds'], () => {
        // If the update was triggered by a record being de-selected,
        // the current selectedRecordId will be retained.  This is
        // what enables the caching described above.
        if (cursor.selectedRecordIds.length > 0) {
            // There might be multiple selected records. We'll use the first
            // one.
            setSelectedRecordId(cursor.selectedRecordIds[0]);
        }
        if (cursor.selectedFieldIds.length > 0) {
            // There might be multiple selected fields. We'll use the first
            // one.
            setSelectedFieldId(cursor.selectedFieldIds[0]);
        }
    });

    // Close the record action error dialog whenever settings are opened or the selected record
    // is updated. (This means you don't have to close the modal to see the settings, or when
    // you've opened a different record.)
    useEffect(() => {
        setRecordActionErrorMessage('');
    }, [isSettingsOpen, selectedRecordId]);

    // Register a callback to be called whenever a record action occurs (via button field)
    // useCallback is used to memoize the callback, to avoid having to register/unregister
    // it unnecessarily.
    const onRecordAction = useCallback(
        data => {
            // Ignore the event if settings are already open.
            // This means we can assume settings are valid (since we force settings to be open if
            // they are invalid).
            if (!isSettingsOpen) {
                if (isEnforced) {
                    if (data.tableId === urlTable.id) {
                        setSelectedRecordId(data.recordId);
                    } else {
                        // Record is from a mismatching table.
                        setRecordActionErrorMessage(
                            `This block is set up to preview URLs using records from the "${urlTable.name}" table, but was opened from a different table.`,
                        );
                    }
                } else {
                    // Preview is not supported in this case, as we wouldn't know what field to preview.
                    // Show a dialog to the user instead.
                    setRecordActionErrorMessage(
                        'You must enable "Use a specific field for previews" to preview URLs with a button field.',
                    );
                }
            }
        },
        [isSettingsOpen, isEnforced, urlTable],
    );
    useEffect(() => {
        // Return the unsubscribe function to ensure we clean up the handler.
        return registerRecordActionDataCallback(onRecordAction);
    }, [onRecordAction]);

    // This watch deletes the cached selectedRecordId and selectedFieldId when
    // the user moves to a new table or view. This prevents the following
    // scenario: User selects a record that contains a preview url. The preview appears.
    // User switches to a different table. The preview disappears. The user
    // switches back to the original table. Weirdly, the previously viewed preview
    // reappears, even though no record is selected.
    useWatchable(cursor, ['activeTableId', 'activeViewId'], () => {
        setSelectedRecordId(null);
        setSelectedFieldId(null);
    });

    const activeTable = base.getTableByIdIfExists(cursor.activeTableId);

    useEffect(() => {
        // Display the settings form if the settings aren't valid.
        if (!isValid && !isSettingsOpen) {
            setIsSettingsOpen(true);
        }
    }, [isValid, isSettingsOpen]);

    // activeTable is briefly null when switching to a newly created table.
    if (!activeTable) {
        return null;
    }

    function checkFieldsCreation() {
        const dayField = table.getFieldByNameIfExists("Day");
        if (!dayField) {
            table.unstable_createFieldAsync("Day", "singleLineText");
        }
        const tripField = table.getFieldByNameIfExists("Name");
        if (!tripField) {
            table.unstable_createFieldAsync("Name", "singleLineText");
        }
        const durationField = table.getFieldByNameIfExists("Duration(hour)");
        if (!durationField) {
            table.unstable_createFieldAsync("Duration(hour)", "number", {precision: 2});
        }
        const addressField = table.getFieldByNameIfExists("Address");
        if (!addressField) {
            table.unstable_createFieldAsync("Address", "singleLineText");
        }
        const typeField = table.getFieldByNameIfExists("Type");
        if (!typeField) {
            table.unstable_createFieldAsync("Type", "singleLineText");
        }
        const latField = table.getFieldByNameIfExists("lat");
        if (!latField) {
            table.unstable_createFieldAsync("lat", "number", {precision: 8});
        }
        const lngField = table.getFieldByNameIfExists("lng");
        if (!lngField) {
            table.unstable_createFieldAsync("lng", "number", {precision: 8});
        }
        const cityField = table.getFieldByNameIfExists("City");
        if (!cityField) {
            table.unstable_createFieldAsync("City", "singleLineText");
        }
        const stateField = table.getFieldByNameIfExists("State");
        if (!stateField) {
            table.unstable_createFieldAsync("State", "singleLineText");
        }
    }

    function writeBackToAirtable(fullTripDetails) {
        const records = fullTripDetails.map((trip) => {
            return { "Day": String(trip.day + 1), "Name": trip.name, "Duration(hour)": trip.adjusted_visit_length / 60, "Address": trip.address, "Type": trip.poi_type, "lat": trip.coord_lat, "lng": trip.coord_long, "City": trip.city, "State": trip.state  }
        });
        checkFieldsCreation();
        table.createRecordsAsync(records);

        setHasAddedTrip(true);
    }

    function writeOutsideTripsToAirtable(outsideTrips) {
        const records = outsideTrips.map((trip) => {
            return trip.map((detail) => {
                return { "Day": String(detail.route + 1), "Name": detail.name, "Duration(hour)": detail.adjusted_visit_length / 60, "Address": detail.address, "Type": detail.poi_type, "lat": detail.coord_lat, "lng": detail.coord_long, "City": detail.city, "State": detail.state  }
            })
        });
        checkFieldsCreation();
        records.map((record) => {
            table.createRecordsAsync(record);
        });
    }

    return (
        <>
            <CssBaseline />
            <Container maxWidth="sm">
                <Typography component="div" style={ homeStyles.wrapper }>
                    <Grid container spacing={3}>
                        <Grid item sx={12} >
                            <FeatureOptions setFeature={setFeature} selectedFeature={selectedFeature}/>
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid item sx={12} >
                            <Setting settingState={settingState} setSettingState={setSettingState}/>
                        </Grid>
                    </Grid>
                    {
                        selectedFeature === "0" && (
                            <Grid container spacing={3} >
                                <Grid item xs={8}>
                                    <Autocomplete
                                        options={options ? options: []}
                                        getOptionLabel={option => option.city_state}
                                        onChange={(event, value) => {
                                            setDestination(value ? value.city_state : "")}
                                        }
                                        renderInput={params => (
                                            <TextField
                                                {...params}
                                                label="Search a place: e.g. San Francisco"
                                                variant="outlined"
                                                onChange={event => handleChange(event.target.value)}
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel id="trip-duration">Days</InputLabel>
                                        <Select
                                            labelId="trip-duration"
                                            id="trip-duration-id"
                                            value={tripDuration}
                                            onChange={e => setTripDuration(e.target.value)}
                                        >
                                            <MenuItem value={1}>1</MenuItem>
                                            <MenuItem value={2}>2</MenuItem>
                                            <MenuItem value={3}>3</MenuItem>
                                            <MenuItem value={4}>4</MenuItem>
                                            <MenuItem value={5}>5</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        )
                    }
                    {
                        selectedFeature === "1" &&
                            <OutsideTrip
                                setCurrentCity={setCurrentCity}
                                setCurrentIntpuCity={handleChange}
                                options={options}
                                setDirection={setDirection}
                                direction={direction}
                                classes={classes}
                            />
                    }
                        {   settingState.map && 
                            <TripMaps
                                tripDetails={tripDetails && tripDetails.length ? tripDetails : outsideTrips && outsideTrips[0]}
                                activeTable={activeTable}
                                selectedRecordId={selectedRecordId}
                                selectedFieldId={selectedFieldId}
                                setIsSettingsOpen={setIsSettingsOpen}
                                currentSelectedDay={currentSelectedDay}
                                setCurrentSelectedDay={setCurrentSelectedDay}
                            />
                        }
                        { settingState.preview &&
                            <Preview
                                activeTable={activeTable}
                                selectedRecordId={selectedRecordId}
                                selectedFieldId={selectedFieldId}
                                setIsSettingsOpen={setIsSettingsOpen}
                            />
                        }
                        { isloading && <Loading /> }
                        { fetchError && <ErrorScreen /> }
                        <div id="map"></div>
                </Typography>
            </Container>
        </>
    )
}

initializeBlock(() => <Home />);

