import React, {useEffect, useState} from 'react'
import {ProgressBar} from "react-materialize";
const { ipcRenderer } = window.require('electron');

const VUMeter = () => {
    const [ampl, setAmpl] = useState({ampl:0, amplF:0});
    const SAMPLE_MAX = Math.pow(2, 31);

    useEffect(() => {
        console.log("Mounted.");
        ipcRenderer.on("AUDIO_SAMPLE", (event, json) => {
            console.log({ json });
            const data = JSON.parse(json);
            setAmpl(data);
        });
    }, []);

    return (
        <React.Fragment>
            <ProgressBar progress={ampl.ampl/SAMPLE_MAX*100} className={'no-transition'} />
            <ProgressBar progress={ampl.amplF/SAMPLE_MAX*100} className={'no-transition'} />
        </React.Fragment>
    )
}

export default VUMeter