import stylex from 'stylex';

const styles = stylex.create({
  container: {
    height: '100vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: '2rem',
    color: 'blue',
  },
});

function App() {
  return (
    <div className={stylex(styles.container)}>
      <h1 className={stylex(styles.title)}>Stylex is fun!</h1>
    </div>
  );
}

export default App;
