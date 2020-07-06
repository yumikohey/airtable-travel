import React from "react";
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

export function Setting({settingState, setSettingState}) {
    const handleChange = (event) => {
        setSettingState({ ...settingState, [event.target.name]: event.target.checked });
    };
    return (
        <FormGroup row>
            <FormControlLabel
                control={<Checkbox checked={settingState.map} onChange={handleChange} name="map" color="primary"/>}
                label="Show routes on map"
            />
            <FormControlLabel
                control={<Checkbox checked={settingState.preview} onChange={handleChange} name="preview" color="primary"/>}
                label="Show preview of a place"
            />
        </FormGroup>
    );
}