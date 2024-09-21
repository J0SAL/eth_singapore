import React from 'react'
import { Button } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext';

function TestContract() {
    const { linkWorldCoinId } = useAuth();
    return (
        <>
            <div>TestContract</div>
            <Button onClick={() => linkWorldCoinId("worldcoinid")}>linkWorldCoinId</Button>
        </>
    )
}

export default TestContract