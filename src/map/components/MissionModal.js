import React, { useRef, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import './modal.css';
import { Menu, MenuItem, Popover } from '@mui/material';

function MissionModal({ coordinates, onInsertPolygon, onClose, onGenerateData }) {
    const [openPopover, setOpenPopover] = useState(null);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const calculateDistance = (coord1, coord2) => {
        const R = 6371e3;
        const dp1 = (coord1[1] * Math.PI) / 180;
        const dp2 = (coord2[1] * Math.PI) / 180;
        const dp3 = ((coord2[1] - coord1[1]) * Math.PI) / 180;
        const dp4 = ((coord2[0] - coord1[0]) * Math.PI) / 180;

        const a =
            Math.sin(dp3 / 2) * Math.sin(dp3 / 2) +
            Math.cos(dp1) * Math.cos(dp2) * Math.sin(dp4 / 2) * Math.sin(dp4 / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const formatCoordinate = (coord) => {
        const lat = coord[1];
        const lng = coord[0];
        const latDir = lat >= 0 ? 'N' : 'S';
        const lngDir = lng >= 0 ? 'E' : 'W';
        return `${Math.abs(lat).toFixed(8)}° ${latDir}, ${Math.abs(lng).toFixed(8)}° ${lngDir}`;
    };

    const handleButtonClick = (e, index) => {
        if (openPopover === index) {
            setOpenPopover(null);
            setAnchorEl(null)
        } else {
            setOpenPopover(index);
            setAnchorEl(e.currentTarget)
        }
    }
    const handleClose = () => {
        setAnchorEl(null);
        setOpenPopover(null);
    };


    const ActionMenu = ({ index }) => (
        <div>
            <MoreVertIcon onClick={(e) => handleButtonClick(e, index)} />
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={openPopover === index}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem onClick={() => {
                    onInsertPolygon(index, 'before');
                    handleClose();
                }}>
                    &#8592;
                    Insert Polygon before
                </MenuItem>
                <MenuItem onClick={() => {
                    onInsertPolygon(index, 'after');
                    handleClose();
                }}>
                    &#8594;
                    Insert Polygon after
                </MenuItem>
            </Menu>
        </div>
    );

    return (
        <div className="modal-base">
            <div className="modal-header">
                <h2 className="modal-title">Mission Creation</h2>
                <button className="modal-back" onClick={onClose}>
                    X
                </button>
            </div>

            <div className="modal-content">
                <h3>Waypoint Navigation</h3>

                {coordinates.length === 0 ? (
                    <div className="empty-state">
                        Click on the map to mark points of the route and then press ← complete the route.
                    </div>
                ) : (
                    <table className="waypoint-table">
                        <thead>
                            <tr>
                                <th>WP</th>
                                <th>Coordinates</th>
                                <th>Distance (m)</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {coordinates.map((item, index) => {
                                if (Array.isArray(item[0])) {
                                    return (
                                        <tr key={`polygon-${index}`}>
                                            <td>{(index + 1).toString().padStart(2, '0')}</td>
                                            <td>Polygon {Math.floor(index / 2) + 1}</td>
                                            <td className="distance-cell">--</td>
                                            <td>
                                                <ActionMenu index={index} />
                                            </td>
                                        </tr>
                                    );
                                } else {
                                    const prevCoord = coordinates[index - 1];
                                    const distance = prevCoord && !Array.isArray(prevCoord[0])
                                        ? calculateDistance(prevCoord, item)
                                        : null;

                                    return (
                                        <tr key={`point-${index}`}>
                                            <td>{(index + 1).toString().padStart(2, '0')}</td>
                                            <td className="coordinates-cell">{formatCoordinate(item)}</td>
                                            <td className="distance-cell">
                                                {distance ? distance.toFixed(1) : '--'}
                                            </td>
                                            <td>
                                                <ActionMenu index={index} />
                                            </td>
                                        </tr>
                                    );
                                }
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="modal-footer">
                <button
                    className="btn btn-primary"
                    onClick={onGenerateData}
                    disabled={coordinates.length === 0}
                >
                    Generate Data
                </button>
            </div>
        </div>
    );

}
export default MissionModal;
