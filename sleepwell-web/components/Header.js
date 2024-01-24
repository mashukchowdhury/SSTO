import styles from "../styles/Header.module.css";

export default function Header({ children }) {
  return (
    <>
      <header className={styles.header}>
        <nav className={styles.navbar}>
          <a className={styles.navlogo}>[SleepWell Logo]</a>
          <div className={styles.navlink}>
            <a>Username </a>
            <a>[pfp]</a>
          </div>
        </nav>
      </header>

      {children}
    </>
  );
}
