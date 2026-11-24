import styles from "./albumForm.module.css";
import { useRef } from "react";

export const AlbumForm = ({ loading, onAdd }) => {
  const albumNameInput = useRef();

  // clear the form
  const handleClear = () => {
    albumNameInput.current.value = "";
  };

  // handle the form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = albumNameInput.current.value.trim();
    if (!name) return;
    if (onAdd) {
      await onAdd(name);
    }
    handleClear();
  };

  return (
    <div className={styles.albumForm}>
      <span>Create an album</span>
      <form onSubmit={handleSubmit}>
        <input required placeholder="Album Name" ref={albumNameInput} />
        <button type="button" onClick={handleClear} disabled={loading}>
          Clear
        </button>
        <button disabled={loading}>Create</button>
      </form>
    </div>
  );
};
