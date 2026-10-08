"use client";

import { useCallback, useRef, useState } from "react";
import { indianStates } from "@/constants/indianStates";

const PINCODE_RE = /^[1-9][0-9]{5}$/;

// India Post still uses a few pre-rename or misspelt state names.
const STATE_ALIASES = {
  chattisgarh: "Chhattisgarh",
  orissa: "Odisha",
  pondicherry: "Puducherry",
  uttaranchal: "Uttarakhand",
  dadraandnagarhaveli: "Dadra and Nagar Haveli and Daman and Diu",
  damananddiu: "Dadra and Nagar Haveli and Daman and Diu",
};

function normalise(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z]/g, "");
}

export function matchState(value) {
  const key = normalise(value);
  if (!key) return "";
  return (
    indianStates.find((s) => normalise(s) === key) || STATE_ALIASES[key] || ""
  );
}

export function isValidPincode(value) {
  return PINCODE_RE.test(String(value || "").trim());
}

export async function lookupPincode(pincode) {
  if (!isValidPincode(pincode)) return null;

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const [result] = await res.json();
    const offices = result?.Status === "Success" ? result.PostOffice || [] : [];
    if (!offices.length) return null;

    const cities = [
      ...new Set(
        offices
          .flatMap((o) => [o.District, o.Block])
          .filter((v) => v && v !== "NA")
      ),
    ];

    return {
      city: offices[0].District || cities[0] || "",
      state: matchState(offices[0].State),
      cities,
    };
  } catch {
    // The lookup is a convenience; the customer can still type city and state.
    return null;
  }
}

/**
 * Looks up a PIN code and hands the result to `onFound`. Responses for a PIN
 * the customer has already typed past are dropped.
 */
export function usePincodeLookup() {
  const latestPin = useRef("");
  const [cities, setCities] = useState([]);
  const [status, setStatus] = useState("idle");

  const lookup = useCallback(async (pincode, onFound) => {
    const pin = String(pincode || "").trim();
    latestPin.current = pin;

    if (!isValidPincode(pin)) {
      setStatus("idle");
      return;
    }

    setStatus("loading");
    const result = await lookupPincode(pin);
    if (latestPin.current !== pin) return;

    if (!result) {
      setCities([]);
      setStatus("notFound");
      return;
    }

    setCities(result.cities);
    setStatus("idle");
    onFound(result);
  }, []);

  return { lookup, cities, status };
}
