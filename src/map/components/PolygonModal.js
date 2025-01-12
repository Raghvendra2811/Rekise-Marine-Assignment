import React from 'react';
import './modal.css';

function PolygonModal({ coordinates = [], onImportPoints, onClose }) {
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

  return (
    <div className="modal-base">
      <div className="modal-header">
        <button className="modal-back" onClick={onClose}>
          &#8592;
        </button>
        <h2 className="modal-title">Mission Planner</h2>
      </div>

      <div className="modal-content">
        <h3>Polygon Tool</h3>

        {coordinates.length === 0 ? (
          <div className="empty-state">
            Click on the map to mark points of the polygon's perimeter, then press ← to close and complete the polygon
          </div>
        ) : (
          <table className="waypoint-table">
            <thead>
              <tr>
                <th>WP</th>
                <th>Coordinates</th>
                <th>Distance (m)</th>
              </tr>
            </thead>
            <tbody>
              {coordinates.map((coord, index) => (
                <tr key={index}>
                  <td>{(index + 1).toString().padStart(2, '0')}</td>
                  <td className="coordinates-cell">{formatCoordinate(coord)}</td>
                  <td className="distance-cell">
                    {index > 0
                      ? calculateDistance(coordinates[index - 1], coord).toFixed(1)
                      : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>
          Discard
        </button>
        <button
          className="btn btn-primary"
          onClick={() => onImportPoints(coordinates)}
          disabled={coordinates.length === 0}
        >
          Import Points
        </button>
      </div>
    </div>
  );
}

export default PolygonModal;
