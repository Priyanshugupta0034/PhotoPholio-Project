import styles from "./imageList.module.css";
import { useState, useRef, useEffect } from "react";
import Spinner from "react-spinner-material";
import { ImageForm } from "../imageForm/ImageForm";
import { Carousel } from "../carousel/Carousel";
import { toast } from "react-toastify";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase.jsx";
export const ImagesList = ({ albumId, albumName, onBack }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchIntent, setSearchIntent] = useState(false);
  const [searchText, setSearchText] = useState("");
  const searchInput = useRef();

  const [addImageIntent, setAddImageIntent] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [updateImageIntent, setUpdateImageIntent] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [activeHoverImageIndex, setActiveHoverImageIndex] = useState(null);

  // images shown on screen (filtered by the search text)
  const visibleImages = searchText
    ? images.filter((img) =>
        img.title.toLowerCase().includes(searchText.toLowerCase())
      )
    : images;

  // get all images of this album from firebase
  const getImages = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "images"), where("albumId", "==", albumId));
      const snapshot = await getDocs(q);
      setImages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      toast.error("Failed to load images.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getImages();
  }, [albumId]);

  // toggle next image in the carousel
  const handleNext = () => {
    if (!visibleImages.length) return;
    setActiveImageIndex((i) => (i + 1) % visibleImages.length);
  };
  // toggle previous image in the carousel
  const handlePrev = () => {
    if (!visibleImages.length) return;
    setActiveImageIndex(
      (i) => (i - 1 + visibleImages.length) % visibleImages.length
    );
  };
  // close the carousel
  const handleCancel = () => setActiveImageIndex(null);

  // open / close the search box
  const handleSearchClick = () => {
    if (searchIntent) {
      setSearchText("");
    }
    setSearchIntent(!searchIntent);
  };
  // filter images by title (local state only)
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // add an image to this album
  const handleAdd = async ({ title, url }) => {
    setImgLoading(true);
    try {
      const image = { albumId, title, url };
      const docRef = await addDoc(collection(db, "images"), image);
      setImages((prev) => [{ id: docRef.id, ...image }, ...prev]);
      toast.success("Image added successfully.");
      setAddImageIntent(false);
    } catch (err) {
      toast.error("Failed to add image.");
    } finally {
      setImgLoading(false);
    }
  };
  // update an image
  const handleUpdate = async ({ title, url }) => {
    setImgLoading(true);
    try {
      await updateDoc(doc(db, "images", updateImageIntent.id), { title, url });
      setImages((prev) =>
        prev.map((img) =>
          img.id === updateImageIntent.id ? { ...img, title, url } : img
        )
      );
      toast.success("Image updated successfully.");
      setUpdateImageIntent(false);
    } catch (err) {
      toast.error("Failed to update image.");
    } finally {
      setImgLoading(false);
    }
  };
  // delete an image
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "images", id));
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast.success("Image deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete image.");
    }
  };

  if (!images.length && !searchText && !loading) {
    return (
      <>
        <div className={styles.top}>
          <span onClick={onBack}>
            <img src="/assets/back.png" alt="back" />
          </span>
          <h3>No images found in the album.</h3>
          <button
            className={`${addImageIntent && styles.active}`}
            onClick={() => setAddImageIntent(!addImageIntent)}
          >
            {!addImageIntent ? "Add image" : "Cancel"}
          </button>
        </div>
        {addImageIntent && (
          <ImageForm
            loading={imgLoading}
            onAdd={handleAdd}
            albumName={albumName}
          />
        )}
      </>
    );
  }
  return (
    <>
      {(addImageIntent || updateImageIntent) && (
        <ImageForm
          loading={imgLoading}
          onAdd={handleAdd}
          albumName={albumName}
          onUpdate={handleUpdate}
          updateIntent={updateImageIntent}
        />
      )}
      {visibleImages[activeImageIndex] && (
        <Carousel
          title={visibleImages[activeImageIndex].title}
          url={visibleImages[activeImageIndex].url}
          onNext={handleNext}
          onPrev={handlePrev}
          onCancel={handleCancel}
        />
      )}
      <div className={styles.top}>
        <span onClick={onBack}>
          <img src="/assets/back.png" alt="back" />
        </span>
        <h3>Images in {albumName}</h3>

        <div className={styles.search}>
          {searchIntent && (
            <input
              placeholder="Search..."
              onChange={handleSearch}
              ref={searchInput}
              autoFocus={true}
            />
          )}
          <img
            onClick={handleSearchClick}
            src={!searchIntent ? "/assets/search.png" : "/assets/clear.png"}
            alt="clear"
          />
        </div>
        {updateImageIntent && (
          <button
            className={styles.active}
            onClick={() => setUpdateImageIntent(false)}
          >
            Cancel
          </button>
        )}
        {!updateImageIntent && (
          <button
            className={`${addImageIntent && styles.active}`}
            onClick={() => setAddImageIntent(!addImageIntent)}
          >
            {!addImageIntent ? "Add image" : "Cancel"}
          </button>
        )}
      </div>
      {loading && (
        <div className={styles.loader}>
          <Spinner color="#0077ff" />
        </div>
      )}
      {!loading && (
        <div className={styles.imageList}>
          {visibleImages.map((image, i) => (
            <div
              key={image.id}
              className={styles.image}
              onMouseOver={() => setActiveHoverImageIndex(i)}
              onMouseOut={() => setActiveHoverImageIndex(null)}
              onClick={() => setActiveImageIndex(i)}
            >
              <div
                className={`${styles.update} ${
                  activeHoverImageIndex === i && styles.active
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setUpdateImageIntent(image);
                }}
              >
                <img src="/assets/edit.png" alt="update" />
              </div>
              <div
                className={`${styles.delete} ${
                  activeHoverImageIndex === i && styles.active
                }`}
                onClick={(e) => handleDelete(e, image.id)}
              >
                <img src="/assets/trash-bin.png" alt="delete" />
              </div>
              <img
                src={image.url}
                alt={image.title}
                onError={({ currentTarget }) => {
                  currentTarget.src = "/assets/warning.png";
                }}
              />
              <span>{image.title.substring(0, 20)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
