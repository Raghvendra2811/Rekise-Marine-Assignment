import React from 'react';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import './missionList.css';

function MissionList({ missions, onShowMission, setShowMission }) {
    return (
        <div className="mission-list" style={{ width: '100%', height: '100vh' }}>
            <div style={{ display: "flex", justifyContent: "space-between",alignItems:"center" }}>
                <h2>Missions</h2>
                <KeyboardDoubleArrowLeftIcon
                    onClick={() => setShowMission(false)}
                    sx={{ fontSize: "24px", background: "#bababa", color: "#333", padding: "3px", borderRadius: "8px 0px 0px 8px", top: "80px", cursor: "pointer" }}

                />
            </div>
            {missions.map((mission, index) => (
                <div key={index} className="mission-item">
                    <span>Mission {index + 1}</span>
                    <button onClick={() => onShowMission(index)}>Show on Map</button>
                </div>
            ))}
        </div>
    );
}

export default MissionList;
