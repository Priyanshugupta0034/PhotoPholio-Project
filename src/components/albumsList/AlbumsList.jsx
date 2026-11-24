import { useState, useEffect } from "react";
import styles from "./albumsList.module.css";
import Spinner from "react-spinner-material";
import { toast } from "react-toastify";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase.jsx";
import { AlbumForm } from "../albumForm/AlbumForm";
import { ImagesList } from "../imagesList/ImagesList";

export const AlbumsList = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [albumAddLoading, setAlbumAddLoading] = useState(false);
  const [albumAddIntent, setAlbumAddIntent] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // get all the albums from firebase
  const getAlbums = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "albums"));
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAlbums(data);
    } catch (err) {
      toast.error("Failed to load albums.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAlbums();
  }, []);

  // add an album
  const handleAdd = async (name) => {
    setAlbumAddLoading(true);
    try {
      const album = { name };
      const docRef = await addDoc(collection(db, "albums"), album);
      setAlbums((prev) => [...prev, { id: docRef.id, ...album }]);
      toast.success("Album added successfully.");
      setAlbumAddIntent(false);
    } catch (err) {
      toast.error("Failed to add album.");
    } finally {
      setAlbumAddLoading(false);
    }
  };

  if (selectedAlbum) {
    return (
      <ImagesList
        albumId={selectedAlbum.id}
        albumName={selectedAlbum.name}
        onBack={() => setSelectedAlbum(null)}
      />
    );
  }

  return (
    <>
      {albumAddIntent && (
        <AlbumForm loading={albumAddLoading} onAdd={handleAdd} />
      )}

      <div className={styles.top}>
        <h3>Your albums</h3>
        <button
          className={albumAddIntent ? styles.active : ""}
          onClick={() => setAlbumAddIntent(!albumAddIntent)}
        >
          {!albumAddIntent ? "Add album" : "Cancel"}
        </button>
      </div>

      {loading && (
        <div className={styles.loader}>
          <Spinner color="#0077ff" />
        </div>
      )}

      {!loading && (
        <div className={styles.albumsList}>
          {albums.map((album) => (
            <div
              key={album.id}
              className={styles.album}
              onClick={() => setSelectedAlbum(album)}
            >
              <img src="/assets/photos.png" alt="images" />
              <span>{album.name}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
