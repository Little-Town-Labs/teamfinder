"use client"

import "mapbox-gl/dist/mapbox-gl.css"

import { useEffect, useRef, useState } from "react"
import { Map, Marker, NavigationControl } from "react-map-gl/mapbox"
import type { MapRef } from "react-map-gl/mapbox"

import { env } from "@/env.mjs"

interface CenterDetailMapProps {
  latitude: string
  longitude: string
  verified: boolean
}

export default function CenterDetailMap({ latitude, longitude, verified }: CenterDetailMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [viewState, setViewState] = useState({
    longitude: parseFloat(longitude),
    latitude: parseFloat(latitude),
    zoom: 14,
  })

  const mapboxToken = env.NEXT_PUBLIC_MAPBOX_TOKEN

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [parseFloat(longitude), parseFloat(latitude)],
        zoom: 14,
        duration: 1000,
      })
    }
  }, [latitude, longitude])

  if (!mapboxToken) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Mapbox token not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full overflow-hidden rounded-lg shadow-md">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxToken}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />

        {/* Center Marker */}
        <Marker longitude={parseFloat(longitude)} latitude={parseFloat(latitude)} anchor="bottom">
          <div className="flex flex-col items-center">
            <svg
              width="32"
              height="48"
              viewBox="0 0 24 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              <path
                d="M12 0C5.372 0 0 5.372 0 12c0 9 12 24 12 24s12-15 12-24c0-6.628-5.372-12-12-12z"
                fill={verified ? "#2563eb" : "#ef4444"}
              />
              <circle cx="12" cy="12" r="4" fill="white" />
            </svg>
          </div>
        </Marker>
      </Map>
    </div>
  )
}
