import React from 'react';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

export function OutsideTrip({ setCurrentCity, setCurrentIntpuCity, setDirection, direction, options, classes }) {
    function handleCurrentCity(event, value) {
        setCurrentCity(value.city_state);
    }
    function handleCityInputChange(event) {
        setCurrentIntpuCity(event.target.value);
    }
    function handleDirectionChange(event) {
        setDirection(event.target.value);
    }
    return (
        <Grid container spacing={4} >
            <Grid item xs={8}>
                <Autocomplete
                    options={options ? options: []}
                    getOptionLabel={option => option.city_state}
                    onChange={handleCurrentCity}
                    renderInput={params => (
                        <TextField
                            {...params}
                            label="Which city are you in? e.g. Seattle, WA"
                            variant="outlined"
                            onChange={handleCityInputChange}
                            fullWidth
                        />
                    )}
                />
            </Grid>
            <Grid item xs={4}>
                <InputLabel id="trip-duration">Direction</InputLabel>
                <FormControl className={classes.formControl}>
                    <Select
                        labelId="trip-duration"
                        id="trip-duration-id"
                        value={direction}
                        onChange={handleDirectionChange}
                    >
                        <MenuItem value={"N"}>North</MenuItem>
                        <MenuItem value={"E"}>East</MenuItem>
                        <MenuItem value={"W"}>West</MenuItem>
                        <MenuItem value={"S"}>South</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    );
}