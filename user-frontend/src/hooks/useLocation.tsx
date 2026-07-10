"use client"

import { useEffect, useState } from "react";

const locationStorageKey = "user_location";
const locationExpiryDays = 20;

const getStoredLocation = ()=>{
    const storedData = localStorage.getItem(locationStorageKey);
    if(!storedData) return null;

    const parsedData = JSON.parse(storedData);
    const expiryTime = locationExpiryDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    const isExpired = Date.now() - parsedData.timestamp > expiryTime;

    return isExpired ? null : parsedData;
}

const useLocationTracking = () => {
    const [location, setLocation ] = useState<{country: string; city: string } | null > (getStoredLocation());

    useEffect(()=>{
        if(location) return;

        fetch("http://ip-api.com/json").then((response)=> response.json()).then((data)=>{
            const newLocation = {
                country: data.country,
                city: data.city,
                timestamp: Date.now()
            };
            localStorage.setItem(locationStorageKey, JSON.stringify(newLocation));
        }).catch((error)=>{
            console.error("Error fetching location:", error);
        })
    },[]);
    return location;
}

export default useLocationTracking;