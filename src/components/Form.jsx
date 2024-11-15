// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";
import DataPicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "./Button";

import styles from "./Form.module.css";
import BackButton from "./BackButton";
import useUrlPostion from "./hooks/useUrlPostion";
import Message from "./Message";
import Spinner from "./Spinner";
import { useNavigate } from "react-router-dom";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

function Form() {
  const [lat, lng] = useUrlPostion();
  const { createCity, isLoading } = useState();
  const navigate = useNavigate();

  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);

  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");

  const [emoji, setEmoji] = useState("");

  const [geocodingError, setGeocondingError] = useState("");

  useEffect(
    function () {
      if (!lat && !lng) return;

      async function fetchcityData() {
        try {
          setIsLoadingGeocoding(true);
          setGeocondingError("");
          const res = await fetch(
            `${BASE_URL}?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();

          console.log(data);
          if (!data.countryCode)
            throw new Error(
              "That doesn't seem to be a city. Click somrwhere else 😉"
            );

          setCityName(data.city || data.locality || "");

          setCountry(data.countryName);

          setEmoji(convertToEmoji(data.countryCode));
        } catch (err) {
          setGeocondingError(err.message);
        } finally {
          setIsLoadingGeocoding(false);
        }
      }
      fetchcityData();
    },

    [lat, lng]
  );

  async function handleSubmit(e) {
    e.preventdefault();
    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };
    await createCity(newCity);
    navigate("/app/cities");
  }

  if (isLoadingGeocoding) return <Spinner />;
  if (!lat && !lng)
    return <Message message="Start by clicking somewhere on the map" />;

  if (geocodingError) return <Message message={geocodingError} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className="{styles.flag}">{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>

        <DataPicker
          id="date"
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
        <button>&larr; Back</button>
      </div>
    </form>
  );
}

export default Form;
