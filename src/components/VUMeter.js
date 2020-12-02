import React, {useEffect, useState} from 'react'
import {ProgressBar} from "react-materialize";
const { ipcRenderer } = window.require('electron');

const VUMeter = () => {
    const [ampl, setAmpl] = useState(0);
    const SAMPLE_MAX = Math.pow(2, 31);

    useEffect(() => {
        console.log("Mounted.");
        ipcRenderer.on("AUDIO_SAMPLE", (event, json) => {
            console.log({ json });
            const data = JSON.parse(json);
            setAmpl(data.ampl);
        });
    }, []);

    return (
        <ProgressBar progress={ampl/SAMPLE_MAX*100} className={'no-transition'} />
    )
}

export default VUMeter