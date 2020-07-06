import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';

export const FeatureOptions = ({setFeature, selectedFeature}) => {
    const handleChange = (event) => {
        setFeature(event.target.value);
    };

    return (
        <FormControl component="fieldset">
            <RadioGroup aria-label="feature" name="feature" value={selectedFeature} onChange={handleChange}>
                <FormControlLabel value="0" control={<Radio />} label="City Trip" />
                <FormControlLabel value="1" control={<Radio />} label="Feeling Lucky" />
            </RadioGroup>
        </FormControl>
    )
}