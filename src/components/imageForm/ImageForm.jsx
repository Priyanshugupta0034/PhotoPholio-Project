import styles from "./imageForm.module.css";
import { useEffect, useRef } from "react";

export const ImageForm = ({
  loading,
  onAdd,
  onUpdate,
  albumName,
  updateIntent,
}) => {
  const imageTitleInput = useRef();
  const imageUrlInput = useRef();

  // handle image form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = imageTitleInput.current.value.trim();
    const url = imageUrlInput.current.value.trim();
    if (!title || !url) return;

    if (updateIntent) {
      if (onUpdate) await onUpdate({ title, url });
    } else if (onAdd) {
      await onAdd({ title, url });
    }
    handleClear();
  };

  // clear the form
  const handleClear = () => {
    imageTitleInput.current.value = "";
    imageUrlInput.current.value = "";
  };

  // prefill the form when editing an image
  const handleDefaultValues = () => {
    if (!updateIntent) return;
    imageTitleInput.current.value = updateIntent.title;
    imageUrlInput.current.value = updateIntent.url;
  };

  useEffect(() => {
    handleDefaultValues();
  }, [updateIntent]);

  return (
    <div className={styles.imageForm}>
      <span>
        {!updateIntent
          ? `Add image to ${albumName}`
          : `Update image ${updateIntent.title}`}
      </span>

      <form onSubmit={handleSubmit}>
        <input required placeholder="Title" ref={imageTitleInput} />
        <input required placeholder="Image URL" ref={imageUrlInput} />
        <div className={styles.actions}>
          <button type="button" onClick={handleClear} disabled={loading}>
            Clear
          </button>
          <button disabled={loading}>{updateIntent ? "Update" : "Add"}</button>
        </div>
      </form>
    </div>
  );
};
