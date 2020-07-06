import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import {
    useRecordById
} from '@airtable/blocks/ui';
import { tripConstants } from '../constants';

export function Preview({activeTable, selectedRecordId}) {
    let [imageUrl, setImageUrl] = useState("");

    const selectedRecord = useRecordById(activeTable, selectedRecordId ? selectedRecordId : '', {
        fields: ["Name", "City", "State"],
    });

    useEffect(() => {
        if (selectedRecord) {
            const name = selectedRecord.getCellValueAsString("Name");
            const city = selectedRecord.getCellValueAsString("City");
            const state = selectedRecord.getCellValueAsString("State");
            if(name && city && state) {
                fetch(`${tripConstants.PLACE_PHOTO}${encodeURIComponent(name)}&city=${city}&state=${state}`)
                .then((result) => {
                    return result.json();
                })
                .then((data) => {
                    if (data && data.poi_image_details) {
                        const imageUrl = data.poi_image_details[0].image;
                        setImageUrl(imageUrl);
                    }
                });
            }
        }
    }, [selectedRecordId])

    return imageUrl && (
        <Grid container>
            <Grid item xs={12} >
                <img 
                    src={`${imageUrl}`}
                    alt="place image"
                    width="100%"
                />
            </Grid>
        </Grid>
    );
}