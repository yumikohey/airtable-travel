import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

export function styles() {
    const wrapper = {
        backgroundImage: "linear-gradient(#FEFEFE, #E8EBF1)",
        height: '200vh',
        marginTop: 20
    };
    return {
        wrapper
    };
}

export function useStyles() {
    const destinationInput = makeStyles(() => ({
        root: {
            height: 20,
            fontSize: 18,
            border: 'none'
        },
    }));
    return {
        destinationInput
    };
}