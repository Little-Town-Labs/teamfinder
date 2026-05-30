"use client"

import "mapbox-gl/dist/mapbox-gl.css"

import { useEffect, useMemo, useRef, useState } from "react"
import { Map, Marker, NavigationControl, Popup } from "react-map-gl/mapbox"
import type { MapRef } from "react-map-gl/mapbox"
import Supercluster from "supercluster"

import type { BowlingCenter } from "@/drizzle/schema"
import { env } from "@/env.mjs"

interface CenterMapProps {
  centers: BowlingCenter[]
  userLat?: number | null
  userLng?: number | null
}

type PointFeature = {
  type: "Feature"
  geometry: {
    type: "Point"
    coordinates: [number, number]
  }
  properties: BowlingCenter & {
    cluster?: boolean
    point_count?: number
  }
}

export default function CenterMap({ centers, userLat, userLng }: CenterMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [popupInfo, setPopupInfo] = useState<BowlingCenter | null>(null)
  const [viewState, setViewState] = useState({
    longitude: -98.5795,
    latitude: 39.8283,
    zoom: 3.5,
  })

  const mapboxToken = env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Create supercluster instance with center points
  const { supercluster, points } = useMemo(() => {
    const cluster = new Supercluster<BowlingCenter>({
      radius: 75,
      maxZoom: 16,
    })

    const pts: PointFeature[] = centers
      .filter((center) => center.latitude && center.longitude)
      .map((center) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [parseFloat(center.longitude!), parseFloat(center.latitude!)],
        },
        properties: center,
      }))

    cluster.load(pts)
    return { supercluster: cluster, points: pts }
  }, [centers])

  // Get clusters for current viewport
  const clusters = useMemo(() => {
    if (!supercluster || points.length === 0) return []

    const bounds = mapRef.current?.getMap().getBounds()
    if (!bounds) {
      // Return all points if bounds aren't available yet
      return points
    }

    return supercluster.getClusters(
      [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      Math.floor(viewState.zoom)
    )
  }, [supercluster, points, viewState.zoom])

  // Auto-fit bounds to show all centers
  useEffect(() => {
    if (!mapRef.current || centers.length === 0) return

    const bounds: [number, number, number, number] = [180, 90, -180, -90]
    let hasBounds = false

    // Include center markers in bounds
    centers.forEach((center) => {
      if (center.latitude && center.longitude) {
        const lng = parseFloat(center.longitude)
        const lat = parseFloat(center.latitude)

        bounds[0] = Math.min(bounds[0], lng) // west
        bounds[1] = Math.min(bounds[1], lat) // south
        bounds[2] = Math.max(bounds[2], lng) // east
        bounds[3] = Math.max(bounds[3], lat) // north
        hasBounds = true
      }
    })

    // Include user location in bounds
    if (userLat && userLng) {
      bounds[0] = Math.min(bounds[0], userLng)
      bounds[1] = Math.min(bounds[1], userLat)
      bounds[2] = Math.max(bounds[2], userLng)
      bounds[3] = Math.max(bounds[3], userLat)
      hasBounds = true
    }

    if (hasBounds) {
      mapRef.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
        duration: 1000,
      })
    }
  }, [centers, userLat, userLng])

  if (!mapboxToken) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300">
            Mapbox token not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[600px] w-full overflow-hidden rounded-lg shadow-md">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxToken}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />

        {/* User Location Marker */}
        {userLat && userLng && (
          <Marker longitude={userLng} latitude={userLat} anchor="bottom">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 shadow-lg">
              <div className="h-3 w-3 rounded-full bg-white" />
            </div>
          </Marker>
        )}

        {/* Clustered Markers */}
        {clusters.map((cluster, index) => {
          const [lng, lat] = cluster.geometry.coordinates
          const properties = cluster.properties as { cluster?: boolean; point_count?: number } & BowlingCenter
          const { cluster: isCluster, point_count } = properties
          const clusterId = (cluster as { id?: number }).id

          if (isCluster) {
            // Render cluster marker
            const size = 30 + (point_count ? Math.min(point_count, 100) / 3 : 0)

            return (
              <Marker key={`cluster-${clusterId ?? index}`} longitude={lng} latitude={lat}>
                <button
                  onClick={() => {
                    if (supercluster && clusterId !== undefined) {
                      const zoom = Math.min(supercluster.getClusterExpansionZoom(clusterId), 16)
                      mapRef.current?.flyTo({ center: [lng, lat], zoom, duration: 500 })
                    }
                  }}
                  className="flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-110"
                  style={{ width: size, height: size }}
                >
                  <span className="font-semibold">{point_count}</span>
                </button>
              </Marker>
            )
          }

          // Render individual center marker
          const center = properties
          return (
            <Marker key={center.id} longitude={lng} latitude={lat} anchor="bottom">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setPopupInfo(center)
                }}
                className="cursor-pointer"
              >
                <svg
                  width="24"
                  height="36"
                  viewBox="0 0 24 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform hover:scale-110"
                >
                  <path
                    d="M12 0C5.372 0 0 5.372 0 12c0 9 12 24 12 24s12-15 12-24c0-6.628-5.372-12-12-12z"
                    fill={center.verified ? "#2563eb" : "#ef4444"}
                  />
                  <circle cx="12" cy="12" r="4" fill="white" />
                </svg>
              </button>
            </Marker>
          )
        })}

        {/* Popup */}
        {popupInfo && popupInfo.latitude && popupInfo.longitude && (
          <Popup
            longitude={parseFloat(popupInfo.longitude)}
            latitude={parseFloat(popupInfo.latitude)}
            anchor="top"
            onClose={() => setPopupInfo(null)}
            className="rounded-lg"
          >
            <div className="min-w-[200px] p-2">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="pr-2 font-semibold text-gray-900">{popupInfo.name}</h3>
                {popupInfo.verified && (
                  <svg className="h-4 w-4 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="mb-1 text-sm text-gray-600">{popupInfo.address}</p>
              <p className="mb-2 text-sm text-gray-600">
                {popupInfo.city}, {popupInfo.state} {popupInfo.zipCode}
              </p>
              {popupInfo.phone && <p className="text-sm text-gray-600">{popupInfo.phone}</p>}
              <a
                href={`/bowling-centers/${popupInfo.id}`}
                className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View Details →
              </a>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}
