import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Draw, Modify } from 'ol/interaction';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { LineString, Polygon, Point } from 'ol/geom';
import { Style, Stroke, Fill, Circle as CircleStyle, Text } from 'ol/style';


function MapComponent({ drawingMode, onDrawComplete, onPolygonComplete, missionToShow, onClearMap, finishDrawing }) {
    const mapRef = useRef();
    const mapInstanceRef = useRef();
    const drawInteractionRef = useRef();
    const vectorSourceRef = useRef(new VectorSource());

    const handleCoordinateUpdate = useCallback((coords) => {
        if (drawingMode === 'LineString') {
            onDrawComplete(coords);
        } else if (drawingMode === 'Polygon') {
            onPolygonComplete(coords[0].filter((ele) => ele));
        }
    }, [drawingMode, onDrawComplete, onPolygonComplete]);

    useEffect(() => {
        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new VectorLayer({
                    source: vectorSourceRef.current,
                    style: (feature) => {
                        const geometry = feature.getGeometry();
                        const isPolygon = geometry instanceof Polygon;
                        const isPoint = geometry instanceof Point;

                        if (isPoint) {
                            return new Style({
                                image: new CircleStyle({
                                    radius: 5,
                                    fill: new Fill({ color: 'red' }),
                                    stroke: new Stroke({ color: 'white', width: 2 })
                                }),
                                text: new Text({
                                    text: feature.get('label'),
                                    offsetY: -15,
                                    fill: new Fill({ color: 'black' }),
                                    stroke: new Stroke({ color: 'white', width: 2 })
                                })
                            });
                        }

                        const styles = [
                            new Style({
                                stroke: new Stroke({
                                    color: isPolygon ? 'orange' : 'blue',
                                    width: 2
                                }),
                                fill: isPolygon ? new Fill({
                                    color: 'rgba(255, 165, 0, 0.2)'
                                }) : undefined
                            })
                        ];

                        if (geometry instanceof LineString) {
                            const coordinates = geometry.getCoordinates();
                            for (let i = 0; i < coordinates.length - 1; i++) {
                                const start = coordinates[i];
                                const end = coordinates[i + 1];
                                const dx = end[0] - start[0];
                                const dy = end[1] - start[1];
                                const rotation = Math.atan2(dy, dx);
                                styles.push(
                                    new Style({
                                        geometry: new Point([(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]),
                                        image: new CircleStyle({
                                            radius: 5,
                                            fill: new Fill({ color: 'blue' }),
                                            rotateWithView: true,
                                            rotation: -rotation
                                        })
                                    })
                                );
                            }
                        }

                        return styles;
                    }
                }),
            ],
            view: new View({
                center: fromLonLat([0, 0]),
                zoom: 2,
            }),
        });

        mapInstanceRef.current = map;

        return () => map.setTarget(undefined);
    }, []);

    useEffect(() => {
        if (onClearMap) {
            onClearMap(() => {
                vectorSourceRef.current.clear(); // Clear all features from the map
            });
        }
    }, [onClearMap]);

    useEffect(() => {
        if (drawingMode) {
            const draw = new Draw({
                source: vectorSourceRef.current,
                type: drawingMode,
            });

            draw.on('drawstart', (event) => {
                const feature = event.feature;
                feature.getGeometry().on('change', () => {
                    const geometry = feature.getGeometry();
                    const tempCoordinates = geometry.getCoordinates();
                    const lonLatCoords = tempCoordinates.map((coord) => toLonLat(coord));
                    handleCoordinateUpdate(lonLatCoords);
                });
            });

            draw.on('drawend', (event) => {
                const feature = event.feature;
                const geometry = feature.getGeometry();
                const coordinates = geometry.getCoordinates();
                const lonLatCoords = coordinates.map((coord) => toLonLat(coord));
                handleCoordinateUpdate(lonLatCoords);
                finishDrawing()
                // Add points for each coordinate
                if (geometry instanceof LineString) {
                    coordinates.forEach((coord, index) => {
                        const pointFeature = new Feature(new Point(coord));
                        pointFeature.set('label', `${index + 1}`);
                        vectorSourceRef.current.addFeature(pointFeature);
                    });
                }

                // Reset drawing mode after completion
                if (drawingMode === 'Polygon') {
                    mapInstanceRef.current.removeInteraction(draw);
                }
            });

            const handleKeyPress = (event) => {
                if (event.key === 'Enter') {
                    draw.finishDrawing(); // Finalize the drawing
                }
            };

            document.addEventListener('keypress', handleKeyPress);

            mapInstanceRef.current.addInteraction(draw);
            drawInteractionRef.current = draw;

            return () => {
                mapInstanceRef.current.removeInteraction(draw);
                document.removeEventListener('keypress', handleKeyPress);
            };
        }
    }, [drawingMode, handleCoordinateUpdate]);

    useEffect(() => {
        if (missionToShow) {
            vectorSourceRef.current.clear();
            missionToShow.forEach((item, index) => {
                if (Array.isArray(item[0])) {
                    // It's a polygon
                    const polygonFeature = new Feature({
                        geometry: new Polygon([item.map(coord => fromLonLat(coord))])
                    });
                    vectorSourceRef.current.addFeature(polygonFeature);

                    // Add a line connecting the polygon to the previous point
                    if (index > 0 && !Array.isArray(missionToShow[index - 1][0])) {
                        const prevPoint = fromLonLat(missionToShow[index - 1]);
                        const firstPolygonPoint = fromLonLat(item[0]);
                        const lineFeature = new Feature({
                            geometry: new LineString([prevPoint, firstPolygonPoint])
                        });
                        vectorSourceRef.current.addFeature(lineFeature);
                    }
                } else {
                    // It's a point
                    const pointFeature = new Feature({
                        geometry: new Point(fromLonLat(item))
                    });
                    pointFeature.set('label', `${index + 1}`);
                    vectorSourceRef.current.addFeature(pointFeature);

                    // Add a line connecting to the next point
                    if (index < missionToShow.length - 1 && !Array.isArray(missionToShow[index + 1][0])) {
                        const nextPoint = fromLonLat(missionToShow[index + 1]);
                        const lineFeature = new Feature({
                            geometry: new LineString([fromLonLat(item), nextPoint])
                        });
                        vectorSourceRef.current.addFeature(lineFeature);
                    }
                }
            });

            // Fit the view to the extent of all features
            const extent = vectorSourceRef.current.getExtent();
            mapInstanceRef.current.getView().fit(extent, { padding: [50, 50, 50, 50] });
        }
    }, [missionToShow]);

    return (
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    );
}

export default React.memo(MapComponent);
