import styles from "./App.module.css";

// components imports
import { Navbar } from "./components/navbar/Navbar.jsx";
import { AlbumsList } from "./components/albumsList/AlbumsList.jsx";

// react toasts
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { toast } from "react-toastify";

function App() {
  return (
    <div className={styles.App}>
      <ToastContainer />
      <Navbar />
      <div className={styles.content}>
        <AlbumsList />
      </div>
    </div>
  );
}

export default App;
