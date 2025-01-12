import React, { useState, useCallback, useRef } from 'react';
import Map from './components/Map';
import DrawButton from './components/DrawButton';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import MissionModal from './components/MissionModal';
import PolygonModal from './components/PolygonModal';
import MissionList from './components/MissionList';
import { Grid } from '@mui/material';

function MapWrapper() {
    const [drawingMode, setDrawingMode] = useState(null);
    const [coordinates, setCoordinates] = useState([]);
    const [polygonCoordinates, setPolygonCoordinates] = useState([]);
    const [showMissionModal, setShowMissionModal] = useState(false);
    const [showPolygonModal, setShowPolygonModal] = useState(false);
    const [insertPosition, setInsertPosition] = useState({ index: -1, position: '' });
    const [missions, setMissions] = useState([]);
    const [activeMission, setActiveMission] = useState(null);
    const [showMissions, setShowMission] = useState(false)
    const clearMapRef = useRef(null);

    const handleDrawClick = () => {
        setDrawingMode('LineString');
        setShowMissionModal(true);
        if (clearMapRef.current) {
            clearMapRef.current();
        }
    };

    const handleCloseModal = () => {
        setShowMissionModal(false);
        setDrawingMode(null);
    };

    const handleClosePolygonModal = () => {
        setShowPolygonModal(false);
        setShowMissionModal(true);
    };

    const handleDrawComplete = useCallback((coords) => {
        console.log({ coords });
        setCoordinates(coords);
    }, []);

    const handelFinishDrawing = () => {
        setDrawingMode(null);
    }
    const handlePolygonComplete = useCallback((coords) => {
        console.log({ polygonCoords: coords });
        setPolygonCoordinates(coords);
    }, []);

    const handleInsertPolygon = (index, position) => {
        setDrawingMode('Polygon');
        setShowMissionModal(false);
        setShowPolygonModal(true);
        setInsertPosition({ index, position });
    };

    const handleImportPoints = (newPolygonCoordinates) => {
        setShowPolygonModal(false);
        setShowMissionModal(true);
        setDrawingMode(null);

        setCoordinates(prev => {
            if (insertPosition.position === 'before') {
                return [
                    ...prev.slice(0, insertPosition.index),
                    newPolygonCoordinates,
                    ...prev.slice(insertPosition.index)
                ];
            } else if (insertPosition.position === 'after') {
                return [
                    ...prev.slice(0, insertPosition.index + 1),
                    newPolygonCoordinates,
                    ...prev.slice(insertPosition.index + 1)
                ];
            }
            return prev;
        });
    };

    const handleGenerateData = () => {
        setMissions(prevMissions => [...prevMissions, coordinates]);
        setCoordinates([]);
        setShowMissionModal(false);
        if (clearMapRef.current) {
            clearMapRef.current();
        }
    };

    const handleShowMission = (index) => {
        setActiveMission(missions[index]);
    };

    return (
        <>
            <Grid container>
                {missions.length > 0 && !showMissions &&
                    <div style={{ position: "relative" }}>
                        <KeyboardDoubleArrowRightIcon onClick={() => setShowMission(true)}
                            sx={{ position: "absolute", zIndex: 100, fontSize: "24px", background: "#bababa", color: "#333", padding: "3px", borderRadius: "0px 8px 8px 0px", top: "80px", cursor: "pointer" }}
                        />
                    </div>
                }
                {showMissions && <Grid xs={2.5}>
                    <MissionList missions={missions} onShowMission={handleShowMission} setShowMission={setShowMission} />
                </Grid>}
                <Grid xs={showMissions ? 9.5 : 12}>
                    <div className="app" style={{ width: '100%', height: '100vh',  position: "relative" }}>
                        <Map
                            drawingMode={drawingMode}
                            onDrawComplete={handleDrawComplete}
                            onPolygonComplete={handlePolygonComplete}
                            missionToShow={activeMission}
                            finishDrawing={handelFinishDrawing}
                            onClearMap={(clearFn) => (clearMapRef.current = clearFn)}
                        />
                        <DrawButton onClick={handleDrawClick} />
                        {showMissionModal && (
                            <MissionModal
                                coordinates={coordinates}
                                onInsertPolygon={handleInsertPolygon}
                                onClose={handleCloseModal}
                                onGenerateData={handleGenerateData}
                            />
                        )}
                        {showPolygonModal && (
                            <PolygonModal
                                coordinates={polygonCoordinates}
                                onImportPoints={handleImportPoints}
                                onClose={handleClosePolygonModal}
                            />
                        )}
                    </div>
                </Grid>
            </Grid >
        </>
    );
}

export default MapWrapper;
