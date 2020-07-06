import React from 'react';
import Grid from '@material-ui/core/Grid';

export const Loading = () => {
    return (
        <Grid container>
            <Grid item xs={12} >
                <img 
                    src={"https://cdn.dribbble.com/users/722246/screenshots/4400319/loading_crescor_dribbble.gif"}
                    alt="loading"
                    width="100%"
                />
            </Grid>
        </Grid>
    );
}