import React, {useEffect, useState} from 'react'
import {Button, Col, Icon, Row, Select} from "react-materialize";
import LEDuinoSerialConnection from "../../lib/LEDuino/LEDuinoSerialConnection";
import e from "../../utils/e";

const ConnectionForm = ({ onConnect }) => {
    const [path, setPath] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ports, setPorts] = useState([]);

    const refreshPorts = () => {
        setLoading(true);
        LEDuinoSerialConnection.listPorts().then(list => {
            setPorts(list);
            setLoading(false);

            if (!path && list.length > 0) {
                setPath(list[0].path);
            }
        });
    }

    useEffect(refreshPorts, []);

    return (
        <form onSubmit={e(onConnect, () => [path])}>
            <div className={'card'}>
                <div className={'card-content'}>
                    <div className={'card-title center'}>Connect to LEDuino</div>
                    <Row style={{ margin: '0.5rem -0.75rem 0 -0.75rem'}}>
                        <Select id={'port'} s={10} label={'Serial Port'} onChange={e => setPath(e.target.value)}>
                            { loading ? <option key={'loading'} value={""} disabled>Loading...</option> : <option key={'select'} value={""} disabled>Select Port</option> }
                            { ports.map((p, i) => <option key={i} value={p.path}>{p.path}: {p.manufacturer}</option>) }
                        </Select>
                        <Col s={2}>
                            <a href={'#'} onClick={e(refreshPorts)} className={'match-input ghost-text right-align'}>
                                <Icon>refresh</Icon>
                            </a>
                        </Col>
                    </Row>
                    <Button type={"submit"} className={'block'} disabled={!path}>Connect { path && `to ${path}`}</Button>
                </div>
            </div>
        </form>
    )
}

export default ConnectionForm;