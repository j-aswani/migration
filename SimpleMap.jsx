import React, { useState, useEffect, useRef } from "react";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { Map, View } from "ol";
import Interaction from "ol/interaction/Interaction";
import "ol/ol.css";
import GeoJSON from "ol/format/GeoJSON";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import { fromLonLat } from "ol/proj.js";
import { Icon, Style, Fill, Stroke } from "ol/style.js";
import { DEVICE_PIXEL_RATIO } from "ol/has.js";
import Card from "./Card";
import dataCenters from "../../../dci/dataCenters.json";
import dataCenterImage from "../../../assets/image/dataCenterImage.png";

function SimpleMap() {
  useEffect(() => {
    const geoFormat = new GeoJSON({
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    const dataCenter = dataCenters.map((dc) => DCIMarker(dc));

    const markerSource = new VectorSource({
      features: dataCenter,
    });

    const markerLayer = new VectorLayer({
      source: markerSource,
    });

    const mapSource = new VectorSource({
      url: "https://dxdtan.github.io/SingaporeMap/SingaporeMap.geojson",
      format: geoFormat,
    });

    // Gradient and pattern are in canvas pixel space, so we adjust for the
    // renderer's pixel ratio
    const pixelRatio = DEVICE_PIXEL_RATIO;

    // Generate a rainbow gradient
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const gradient = context.createLinearGradient(0, 0, 1024 * pixelRatio, 0);
    gradient.addColorStop(0, "rgba(113, 223, 80, 1)");
    gradient.addColorStop(1 / 6, "rgba(113, 223, 80, 0.9)");
    gradient.addColorStop(2 / 6, "rgba(113, 223, 80, 0.8)");
    gradient.addColorStop(3 / 6, "rgba(113, 223, 80, 0.7)");
    gradient.addColorStop(4 / 6, "rgba(113, 223, 80, 0.6)");
    gradient.addColorStop(5 / 6, "rgba(113, 223, 80, 0.5)");
    gradient.addColorStop(1, "rgba(113, 223, 80, 0.4)");

    const mapLayer = new VectorLayer({
      background: "#8CAAD9",
      source: mapSource,
      style: new Style({
        fill: new Fill({ color: gradient }),
        // stroke: new Stroke({
        //   color: "#D6F6CB",
        //   width: 1,
        // }),
      }),
    });

    const map = new Map({
      target: "map",
      interactions: [
        new Interaction({
          dragPan: false,
        }),
      ],
      layers: [mapLayer, markerLayer],
      view: new View({
        center: [11559777.51, 145668.88],
        minZoom: 0,
        zoom: 10.6,
      }),
      controls: [],
    });

    const info = document.getElementById("info");
    let currentFeature;
    const displayFeatureInfo = function (pixel) {
      const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
      });
      if (feature && feature.get("siteName") && feature.get("location")) {
        info.style.left = pixel[0] + "px";
        info.style.top = pixel[1] + "px";
        if (feature !== currentFeature) {
          info.style.visibility = "visible";
          info.innerText = `Data Center: ${feature.get("siteName")}`;
        }
      } else {
        info.style.visibility = "hidden";
      }
      currentFeature = feature;
    };

    map.on("pointermove", function (evt) {
      if (evt.dragging) {
        info.style.visibility = "hidden";
        currentFeature = undefined;
        return;
      }
      const pixel = map.getEventPixel(evt.originalEvent);
      displayFeatureInfo(pixel, evt.originalEvent.target);
    });

    map.getTargetElement().addEventListener("pointerleave", function () {
      currentFeature = undefined;
      info.style.visibility = "hidden";
    });

    return () => map.setTarget(null);
  }, []);

  return (
    <Card bodyStyle={{ margin: "0px !important" }}>
      <div style={{ height: "100%", width: "100%" }} id="map" className="map-container">
        <div id="info" className="markerPopup"></div>
      </div>
    </Card>
  );
}

function DCIMarker(dc) {
  const feature = new Feature({
    geometry: new Point(fromLonLat([dc.long, dc.lat])),
    siteName: dc.siteName,
    location: dc.location,
  });

  feature.setStyle(
    new Style({
      image: new Icon({
        // color: "#666666",
        crossOrigin: "anonymous",
        src: dataCenterImage,
        scale: 0.08,
      }),
    })
  );

  return feature;
}

export default SimpleMap;
