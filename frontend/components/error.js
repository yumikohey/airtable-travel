import React from 'react';
import Grid from '@material-ui/core/Grid';

export const ErrorScreen = () => {
    return (
        <Grid container>
            <Grid item xs={12} >
                <img 
                    src={"https://cdn.dribbble.com/users/1078347/screenshots/2799566/oops.png"}
                    alt="loading"
                    width="100%"
                />
            </Grid>
        </Grid>
    );
}